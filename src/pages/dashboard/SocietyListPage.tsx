import React, { useState } from 'react';
import { Building2, Plus, Eye, Edit2, Trash2, Power, AlertTriangle } from 'lucide-react';
import {
  useSocieties,
  useDeleteSociety,
  useToggleSocietyStatus,
  useBulkSocietyAction,
} from '../../hooks/useSociety';
import { Society, SocietyStatus } from '../../types/society';
import { ColumnDef, TableAction } from '../../types/table';
import { DataTable } from '../../components/data-table/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ErrorState } from '../../components/feedback/ErrorState';
import { SocietyFilterBar } from '../../components/society/SocietyFilterBar';
import { SocietyFormModal } from '../../components/society/SocietyFormModal';
import { SocietyDetailsDrawer } from '../../components/society/SocietyDetailsDrawer';
import { BulkActionsToolbar } from '../../components/society/BulkActionsToolbar';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';

export const SocietyListPage: React.FC = () => {
  // Query Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SocietyStatus | 'all'>('all');
  const [city, setCity] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  // Modal / Drawer Selection States
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [societyToEdit, setSocietyToEdit] = useState<Society | null>(null);
  const [societyToView, setSocietyToView] = useState<Society | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [societyToDelete, setSocietyToDelete] = useState<Society | null>(null);

  // TanStack Query Hooks
  const { data, isLoading, isError, refetch } = useSocieties({
    page,
    limit,
    search: debouncedSearch,
    status,
    city,
  });

  const deleteMutation = useDeleteSociety();
  const toggleStatusMutation = useToggleSocietyStatus();
  const bulkActionMutation = useBulkSocietyAction();

  // Reset pagination when search or filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: SocietyStatus | 'all') => {
    setStatus(val);
    setPage(1);
  };

  const handleCityChange = (val: string) => {
    setCity(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setCity('');
    setPage(1);
  };

  // Row Action Handlers
  const handleOpenCreateModal = () => {
    setSocietyToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (society: Society) => {
    setSocietyToEdit(society);
    setIsFormModalOpen(true);
  };

  const handleOpenViewDrawer = (society: Society) => {
    setSocietyToView(society);
    setIsDrawerOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!societyToDelete) return;
    try {
      await deleteMutation.mutateAsync(societyToDelete.id);
      setSocietyToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggleStatus = (society: Society) => {
    const newStatus = society.status === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ id: society.id, status: newStatus });
  };

  // Bulk Action Handlers
  const handleBulkActivate = async () => {
    await bulkActionMutation.mutateAsync({ ids: selectedKeys, action: 'activate' });
    setSelectedKeys([]);
  };

  const handleBulkDeactivate = async () => {
    await bulkActionMutation.mutateAsync({ ids: selectedKeys, action: 'deactivate' });
    setSelectedKeys([]);
  };

  const handleBulkDelete = async () => {
    await bulkActionMutation.mutateAsync({ ids: selectedKeys, action: 'delete' });
    setSelectedKeys([]);
  };

  // Table Columns Definition
  const columns: ColumnDef<Society>[] = [
    {
      key: 'name',
      header: 'Society Name & Code',
      sortable: true,
      accessor: (row) => (
        <div>
          <button
            onClick={() => handleOpenViewDrawer(row)}
            className="font-serif font-bold text-sm text-[var(--foreground)] hover:text-[var(--gold)] text-left transition cursor-pointer"
          >
            {row.name}
          </button>
          <div className="font-mono text-[10px] text-[var(--gold)] font-semibold mt-0.5">
            {row.code}
          </div>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      sortable: true,
      accessor: (row) => (
        <div className="font-body text-xs text-[var(--foreground)]">
          <div>{row.city}, {row.state}</div>
          <div className="font-mono text-[10px] text-[var(--muted-foreground)]">{row.postalCode}</div>
        </div>
      ),
    },
    {
      key: 'totalVendorsCount',
      header: 'Vendors',
      sortable: true,
      align: 'center',
      accessor: (row) => (
        <span className="font-serif text-base font-bold text-[var(--foreground)]">
          {row.totalVendorsCount}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => (
        <Badge
          variant={row.status === 'active' ? 'forest' : 'secondary'}
          className="capitalize cursor-pointer"
          onClick={() => handleToggleStatus(row)}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Onboarded Date',
      sortable: true,
      accessor: (row) => (
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  // Table Row Actions Definition
  const actions: TableAction<Society>[] = [
    {
      label: 'View',
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (row) => handleOpenViewDrawer(row),
    },
    {
      label: 'Edit',
      icon: <Edit2 className="h-3.5 w-3.5" />,
      onClick: (row) => handleOpenEditModal(row),
    },
    {
      label: 'Status',
      icon: <Power className="h-3.5 w-3.5" />,
      onClick: (row) => handleToggleStatus(row),
    },
    {
      label: 'Delete',
      variant: 'destructive',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (row) => setSocietyToDelete(row),
    },
  ];

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load Societies"
          description="There was a problem fetching the society registry. Please check your connection and retry."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[var(--gold)]" />
            <span className="font-mono-meta text-xs text-[var(--gold)] font-semibold">
              COMMUNITY DIRECTORY
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Society Management
          </h1>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1">
            Onboard, configure, and monitor residential societies and local vendor allocations.
          </p>
        </div>

        <Button
          variant="default"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleOpenCreateModal}
        >
          Register New Society
        </Button>
      </div>

      {/* Filter Bar */}
      <SocietyFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        city={city}
        onCityChange={handleCityChange}
        onClearFilters={handleClearFilters}
      />

      {/* Reusable Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchable={false}
        selectable
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        actions={actions}
        emptyTitle="No societies found"
        emptyDescription="No registered residential societies match your current query or filters."
        pagination={
          data?.meta
            ? {
                page: data.meta.page,
                limit: data.meta.limit,
                totalItems: data.meta.totalItems,
                totalPages: data.meta.totalPages,
                onPageChange: (newPage) => setPage(newPage),
              }
            : undefined
        }
      />

      {/* Floating Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedKeys.length}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedKeys([])}
        isLoading={bulkActionMutation.isPending}
      />

      {/* Create / Edit Form Modal */}
      <SocietyFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        societyToEdit={societyToEdit}
      />

      {/* View Details Drawer */}
      <SocietyDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        society={societyToView}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(societyToDelete)}
        onClose={() => setSocietyToDelete(null)}
        size="sm"
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Confirm Deletion</span>
          </div>
        }
      >
        <div className="space-y-4 py-2 font-body text-sm text-[var(--foreground)]">
          <p>
            Are you sure you want to delete{' '}
            <strong className="font-semibold text-[var(--foreground)]">{societyToDelete?.name}</strong>? This action will disassociate all registered vendors.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="outline" onClick={() => setSocietyToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              Delete Society
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
