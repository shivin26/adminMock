import React, { useState, useMemo } from 'react';
import './SocietiesPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable/DataTable';
import type { Column } from '../../components/common/DataTable/DataTable';
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { Badge } from '../../components/common/Badge/Badge';
import {
  useSocieties,
  useCreateSociety,
  useEditSociety,
  useToggleSocietyStatus,
} from '../../hooks/useSocieties';
import type { Society } from '../../types/society.types';
import type { CreateSocietyFormValues } from '../../utils/validation.schemas';
import { formatDate } from '../../utils/formatters.utils';

import { Plus, Search, MapPin, Building2, Edit2, Ban, CheckCircle2 } from 'lucide-react';
import { SocietyFormModal } from '../../components/societies/SocietyFormModal';
import { SocietyDetailsDrawer } from '../../components/societies/SocietyDetailsDrawer';
import { SocietyBlockConfirmModal } from '../../components/societies/SocietyBlockConfirmModal';
import { SocietyApprovalModal } from '../../components/societies/SocietyApprovalModal';


type SocietyStatusTab = 'all' | 'active' | 'pending' | 'suspended';
type SocietySortOption = 'name-asc' | 'name-desc' | 'vendors-desc' | 'vendors-asc' | 'newest' | 'oldest';

export const SocietiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<SocietyStatusTab>('all');
  const [sortBy, setSortBy] = useState<SocietySortOption>('name-asc');

  const { data: rawSocieties, isLoading } = useSocieties(searchTerm);
  const createSocietyMutation = useCreateSociety();
  const editSocietyMutation = useEditSociety();
  const toggleStatusMutation = useToggleSocietyStatus();

  const societies = useMemo(() => (Array.isArray(rawSocieties) ? rawSocieties : []), [rawSocieties]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [editingSociety, setEditingSociety] = useState<Society | null>(null);
  const [blockingSociety, setBlockingSociety] = useState<Society | null>(null);
  const [approvingSociety, setApprovingSociety] = useState<Society | null>(null);

  // Tab counts
  const pendingCount = useMemo(() => societies.filter((s) => s && s.status === 'pending').length, [societies]);
  const activeCount = useMemo(() => societies.filter((s) => s && s.status === 'active').length, [societies]);
  const suspendedCount = useMemo(() => societies.filter((s) => s && s.status === 'suspended').length, [societies]);

  // Filtered & Sorted dataset
  const filteredSocieties = useMemo(() => {
    if (activeTab === 'all') return societies;
    return societies.filter((s) => s.status === activeTab);
  }, [societies, activeTab]);

  const displayedSocieties = useMemo(() => {
    const list = [...filteredSocieties];
    switch (sortBy) {
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case 'vendors-desc':
        return list.sort((a, b) => (b.totalVendorsCount || 0) - (a.totalVendorsCount || 0));
      case 'vendors-asc':
        return list.sort((a, b) => (a.totalVendorsCount || 0) - (b.totalVendorsCount || 0));
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      case 'oldest':
        return list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      default:
        return list;
    }
  }, [filteredSocieties, sortBy]);

  const handleCreateSubmit = (values: CreateSocietyFormValues) => {
    createSocietyMutation.mutate(
      {
        society_name: values.name,
        location: `${values.address}, ${values.city}, ${values.state}`,
      },
      {
        onSuccess: () => setIsCreateModalOpen(false),
      }
    );
  };

  const handleEditSubmit = (values: CreateSocietyFormValues) => {
    if (!editingSociety) return;
    editSocietyMutation.mutate(
      {
        id: editingSociety.id,
        payload: {
          society_name: values.name,
          location: `${values.address}, ${values.city}, ${values.state}`,
        },
      },
      {
        onSuccess: () => setEditingSociety(null),
      }
    );
  };


  const handleConfirmBlockStatus = (
    id: string | number,
    targetStatus: 'active' | 'suspended',
    _customMessage?: string
  ) => {
    toggleStatusMutation.mutate(
      { id, status: targetStatus },
      {
        onSuccess: () => setBlockingSociety(null),
      }
    );
  };

  const handleConfirmApproval = (id: string | number) => {
    toggleStatusMutation.mutate(
      { id, status: 'active' },
      {
        onSuccess: () => setApprovingSociety(null),
      }
    );
  };

  const columns: Column<Society>[] = [
    {
      header: 'S.No.',
      cell: (_item, index) => <span className="font-mono text-xs text-[#18281F] font-bold">{index + 1}</span>,
    },
    {
      header: 'Society Details',
      cell: (society) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFE8D8] text-[#18281F] border border-[#E4DCC9] flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <span className="font-bold text-[#18281F] text-xs block">{society.name}</span>
            <span className="text-[11px] text-[#6B7C70]">Code: {society.code}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      cell: (society) => (
        <div className="flex items-center gap-1.5 text-xs text-[#18281F]">
          <MapPin size={14} className="text-[#C4A066] shrink-0" />
          <span>{society.address}</span>
        </div>
      ),
    },
    {
      header: 'Vendors Count',
      cell: (society) => (
        <Badge variant="primary">
          {society.totalVendorsCount} VENDORS
        </Badge>
      ),
    },
    {
      header: 'Status',
      cell: (society) => {
        if (society.status === 'pending') {
          return <Badge variant="warning">PENDING APPROVAL</Badge>;
        }
        if (society.status === 'suspended') {
          return <Badge variant="danger">SUSPENDED</Badge>;
        }
        return <Badge variant="success">ACTIVE</Badge>;
      },
    },
    {
      header: 'Registered On',
      cell: (society) => <span>{formatDate(society.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (society) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {society.status === 'pending' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 size={16} />}
              title="Approve Society Onboarding"
              aria-label="Approve Society Onboarding"
              onClick={() => setApprovingSociety(society)}
            >
              Approve
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit2 size={16} />}
            title="Edit Society Parameters"
            aria-label="Edit Society Parameters"
            onClick={() => setEditingSociety(society)}
          >
            Edit
          </Button>

          <Button
            variant={society.status === 'suspended' ? 'outline' : 'ghost'}
            size="sm"
            leftIcon={<Ban size={16} />}
            className={society.status === 'suspended' ? 'text-emerald-600' : 'text-rose-600'}
            title={society.status === 'suspended' ? 'Unblock Society Enclave' : 'Block / Suspend Society Enclave'}
            aria-label={society.status === 'suspended' ? 'Unblock Society Enclave' : 'Block / Suspend Society Enclave'}
            onClick={() => setBlockingSociety(society)}
          >
            {society.status === 'suspended' ? 'Unblock' : 'Block'}
          </Button>
        </div>
      ),
    },

  ];

  return (
    <div className="societies-page">
      <PageHeader
        title="Location Areas & Societies"
        description="View registered areas, location enclaves, and society clusters. Vendor service locations are registered during vendor onboarding and approved by admin."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add New Area / Location
          </Button>
        }
      />

      {/* Control Bar & Filter Tabs */}
      <div className="societies-control-bar">
        <div className="society-tabs">
          <button
            className={`stab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Location Areas ({societies.length})
          </button>
          <button
            className={`stab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Service Areas ({activeCount + pendingCount})
          </button>
          <button
            className={`stab-btn ${activeTab === 'suspended' ? 'active' : ''}`}
            onClick={() => setActiveTab('suspended')}
          >
            Inactive Areas ({suspendedCount})
          </button>
        </div>

        <div className="society-control-filters">
          <select
            className="society-select-filter"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SocietySortOption)}
          >
            <option value="name-asc">Alphabetical (A – Z)</option>
            <option value="name-desc">Alphabetical (Z – A)</option>
            <option value="vendors-desc">Most Vendors</option>
            <option value="vendors-asc">Least Vendors</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <Input
            placeholder="Search by society name, code, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
            className="society-search-input"
          />
        </div>
      </div>

      <DataTable<Society>
        columns={columns}
        data={displayedSocieties}
        isLoading={isLoading}
        emptyMessage="No residential societies match the selected filter criteria."
        onRowClick={(society) => setSelectedSociety(society)}
      />

      {/* Register New Society Modal */}
      <SocietyFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createSocietyMutation.isPending}
      />

      {/* Edit Society Modal */}
      <SocietyFormModal
        isOpen={!!editingSociety}
        onClose={() => setEditingSociety(null)}
        onSubmit={handleEditSubmit}
        isLoading={editSocietyMutation.isPending}
        initialData={editingSociety}
      />



      {/* Slide-over Society Details Drawer */}
      <SocietyDetailsDrawer
        isOpen={!!selectedSociety}
        onClose={() => setSelectedSociety(null)}
        society={selectedSociety}
      />

      {/* Block / Unblock Confirmation Modal */}
      <SocietyBlockConfirmModal
        isOpen={!!blockingSociety}
        onClose={() => setBlockingSociety(null)}
        onConfirm={handleConfirmBlockStatus}
        society={blockingSociety}
        isLoading={toggleStatusMutation.isPending}
      />

      {/* First-Time Society Approval Modal */}
      <SocietyApprovalModal
        isOpen={!!approvingSociety}
        onClose={() => setApprovingSociety(null)}
        onConfirmApprove={handleConfirmApproval}
        society={approvingSociety}
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
};
