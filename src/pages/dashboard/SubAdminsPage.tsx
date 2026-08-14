import React, { useState } from 'react';
import './SubAdminsPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable/DataTable';
import type { Column } from '../../components/common/DataTable/DataTable';
import { Button } from '../../components/common/Button/Button';
import { Badge } from '../../components/common/Badge/Badge';
import {
  useSubAdmins,
  useCreateSubAdmin,
  useUpdateSubAdminPowers,
  useDeleteSubAdmin,
} from '../../hooks/useSubAdmins';
import type { SubAdminUser, PowerSection } from '../../types/rbac.types';
import { formatDate } from '../../utils/formatters.utils';
import { Plus, ShieldAlert, ShieldCheck, Edit3, Trash2 } from 'lucide-react';
import { CreateSubAdminModal } from '../../components/rbac/CreateSubAdminModal';
import { EditSubAdminPowersModal } from '../../components/rbac/EditSubAdminPowersModal';
import { RevokeSubAdminModal } from '../../components/rbac/RevokeSubAdminModal';

export const SubAdminsPage: React.FC = () => {
  const { data: subAdmins = [], isLoading } = useSubAdmins();
  const createSubAdminMutation = useCreateSubAdmin();
  const updatePowersMutation = useUpdateSubAdminPowers();
  const deleteSubAdminMutation = useDeleteSubAdmin();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState<SubAdminUser | null>(null);
  const [revokingSubAdmin, setRevokingSubAdmin] = useState<SubAdminUser | null>(null);

  const handleCreateSubmit = (values: any) => {
    createSubAdminMutation.mutate(values, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleUpdatePowers = (subAdminId: string, powers: PowerSection[]) => {
    updatePowersMutation.mutate(
      { id: subAdminId, payload: { powers } },
      {
        onSuccess: () => setEditingSubAdmin(null),
      }
    );
  };

  const handleConfirmRevoke = (id: string) => {
    deleteSubAdminMutation.mutate(id, {
      onSuccess: () => setRevokingSubAdmin(null),
    });
  };

  const columns: Column<SubAdminUser>[] = [
    {
      header: 'S.No.',
      cell: (_item, index) => <span className="font-mono text-xs text-[#18281F] font-bold">{index + 1}</span>,
    },
    {
      header: 'Sub-Admin User',
      cell: (sub) => (
        <div className="subadmin-user-cell">
          <div className="subadmin-avatar">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="subadmin-name">{sub.name}</span>
            <span className="subadmin-email">{sub.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role Title',
      cell: () => <Badge variant="primary">SUB-ADMIN</Badge>,
    },
    {
      header: 'Delegated Power Sections',
      cell: (sub) => (
        <div className="flex flex-wrap gap-1.5">
          {sub.powers.map((power) => (
            <Badge key={power} variant="info" size="sm">
              {power}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Account Status',
      cell: (sub) => (
        <Badge variant={sub.status === 'active' ? 'success' : 'danger'}>
          {sub.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Created Date',
      cell: (sub) => <span>{formatDate(sub.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (sub) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            title="Edit Sub-Admin Delegated Power Sections"
            aria-label="Edit Sub-Admin Delegated Power Sections"
            onClick={() => setEditingSubAdmin(sub)}
          >
            <Edit3 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500 hover:bg-rose-500/10"
            title="Revoke Sub-Admin Access"
            aria-label="Revoke Sub-Admin Access"
            onClick={() => setRevokingSubAdmin(sub)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },

  ];

  return (
    <div className="subadmins-page">
      <PageHeader
        title="Sub-Admin Power Management"
        description="Delegate specific power sections (Societies, Vendors, Financials, Settings) to company sub-admin accounts."
        action={
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Sub-Admin
          </Button>
        }
      />

      <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#18281F] text-[#E6C35C] flex items-center justify-center shrink-0">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#18281F]">Super Admin Control Center</h4>
          <p className="text-xs text-[#6B7C70]">
            Super Admins hold absolute system power. Delegated Sub-Admins will strictly see and manage only the power sections selected for their account.
          </p>
        </div>
      </div>

      <DataTable<SubAdminUser>
        columns={columns}
        data={subAdmins}
        isLoading={isLoading}
        emptyMessage="No sub-admin accounts created yet. Click 'Create Sub-Admin' above to delegate access."
      />

      {/* Create Sub-Admin Modal */}
      <CreateSubAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createSubAdminMutation.isPending}
      />

      {/* Edit Powers Modal */}
      <EditSubAdminPowersModal
        isOpen={!!editingSubAdmin}
        onClose={() => setEditingSubAdmin(null)}
        onConfirm={handleUpdatePowers}
        subAdmin={editingSubAdmin}
        isLoading={updatePowersMutation.isPending}
      />

      {/* Revoke Sub-Admin Warning Modal */}
      <RevokeSubAdminModal
        isOpen={!!revokingSubAdmin}
        onClose={() => setRevokingSubAdmin(null)}
        onConfirm={handleConfirmRevoke}
        subAdmin={revokingSubAdmin}
        isLoading={deleteSubAdminMutation.isPending}
      />
    </div>
  );
};
