import React, { useState } from 'react';
import { Store, Plus, Eye, Edit2, Trash2, ShieldAlert, AlertTriangle } from 'lucide-react';
import {
  useVendors,
  useDeleteVendor,
  useToggleVendorStatus,
  useBulkVendorAction,
} from '../../hooks/useVendor';
import { Vendor, VendorStatus, SubscriptionTier } from '../../types/vendor';
import { ColumnDef, TableAction } from '../../types/table';
import { DataTable } from '../../components/data-table/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ErrorState } from '../../components/feedback/ErrorState';
import { VendorFilterBar } from '../../components/vendor/VendorFilterBar';
import { VendorFormModal } from '../../components/vendor/VendorFormModal';
import { VendorProfileDrawer } from '../../components/vendor/VendorProfileDrawer';
import { VendorBulkActionsToolbar } from '../../components/vendor/VendorBulkActionsToolbar';
import { PeopleDetailsDrawer } from '../../components/people/PeopleDetailsDrawer';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/formatters';

export const VendorListPage: React.FC = () => {
  // Query Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<VendorStatus | 'all'>('all');
  const [tier, setTier] = useState<SubscriptionTier | 'all'>('all');
  const [category, setCategory] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  // Modal / Drawer Selection States
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [vendorToView, setVendorToView] = useState<Vendor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);

  // TanStack Query Hooks
  const { data, isLoading, isError, refetch } = useVendors({
    page,
    limit,
    search: debouncedSearch,
    status,
    tier,
    category,
  });

  const deleteMutation = useDeleteVendor();
  const toggleStatusMutation = useToggleVendorStatus();
  const bulkActionMutation = useBulkVendorAction();

  // Reset pagination when search or filters change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: VendorStatus | 'all') => {
    setStatus(val);
    setPage(1);
  };

  const handleTierChange = (val: SubscriptionTier | 'all') => {
    setTier(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setTier('all');
    setCategory('');
    setPage(1);
  };

  // Row Action Handlers
  const handleOpenCreateModal = () => {
    setVendorToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (vendor: Vendor) => {
    setVendorToEdit(vendor);
    setIsFormModalOpen(true);
  };

  const handleOpenViewDrawer = (vendor: Vendor) => {
    setVendorToView(vendor);
    setIsDrawerOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      await deleteMutation.mutateAsync(vendorToDelete.id);
      setVendorToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggleStatus = (vendor: Vendor) => {
    const nextStatus: VendorStatus = vendor.status === 'active' ? 'suspended' : 'active';
    toggleStatusMutation.mutate({ id: vendor.id, status: nextStatus });
  };

  // Bulk Action Handlers
  const handleBulkActivate = async () => {
    await bulkActionMutation.mutateAsync({ ids: selectedKeys, action: 'activate' });
    setSelectedKeys([]);
  };

  const handleBulkSuspend = async () => {
    await bulkActionMutation.mutateAsync({ ids: selectedKeys, action: 'suspend' });
    setSelectedKeys([]);
  };

  const handleBulkDelete = async () => {
    await bulkActionMutation.mutateAsync({ ids: selectedKeys, action: 'delete' });
    setSelectedKeys([]);
  };

  // Table Columns Definition
  const columns: ColumnDef<Vendor>[] = [
    {
      key: 'storeName',
      header: 'Store & Owner',
      sortable: true,
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80'}
            alt={row.storeName}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-[var(--gold)]/40 shrink-0"
          />
          <div>
            <button
              onClick={() => handleOpenViewDrawer(row)}
              className="font-serif font-bold text-sm text-[var(--foreground)] hover:text-[var(--gold)] text-left transition cursor-pointer"
            >
              {row.storeName}
            </button>
            <div className="font-mono text-[10px] text-[var(--muted-foreground)]">
              {row.ownerName} • {row.societyName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category & GSTIN',
      sortable: true,
      accessor: (row) => (
        <div>
          <Badge variant="secondary" className="capitalize">
            {row.category}
          </Badge>
          <div className="font-mono text-[10px] text-[var(--muted-foreground)] mt-1">
            {row.gstin}
          </div>
        </div>
      ),
    },
    {
      key: 'subscriptionTier',
      header: 'Subscription',
      sortable: true,
      accessor: (row) => {
        const isSub = row.status === 'active' || row.subscriptionTier === 'subscribed';
        return (
          <Badge variant={isSub ? 'forest' : 'secondary'} className="capitalize">
            {isSub ? 'Subscribed' : 'Not Subscribed'}
          </Badge>
        );
      },
    },
    {
      key: 'totalEarnings',
      header: 'Earnings',
      sortable: true,
      align: 'right',
      accessor: (row) => (
        <span className="font-mono font-bold text-sm text-[var(--foreground)]">
          {formatCurrency(row.totalEarnings)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => (
        <Badge
          variant={
            row.status === 'active'
              ? 'forest'
              : row.status === 'suspended'
              ? 'destructive'
              : 'warning'
          }
          className="capitalize cursor-pointer"
          onClick={() => handleToggleStatus(row)}
        >
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
  ];

  // Table Row Actions Definition
  const actions: TableAction<Vendor>[] = [
    {
      label: 'Profile',
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (row) => handleOpenViewDrawer(row),
    },
    {
      label: 'Edit',
      icon: <Edit2 className="h-3.5 w-3.5" />,
      onClick: (row) => handleOpenEditModal(row),
    },
    {
      label: 'Toggle Status',
      icon: <ShieldAlert className="h-3.5 w-3.5" />,
      onClick: (row) => handleToggleStatus(row),
    },
    {
      label: 'Delete',
      variant: 'destructive',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      onClick: (row) => setVendorToDelete(row),
    },
  ];

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load Vendors"
          description="There was a problem fetching the vendor directory. Please check your connection and retry."
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
            <Store className="h-5 w-5 text-[var(--gold)]" />
            <span className="font-mono-meta text-xs text-[var(--gold)] font-semibold">
              VENDOR REGISTRY
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Vendor Management
          </h1>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1">
            Manage merchant profiles, GST verification, subscription plans, payouts, and operating hours.
          </p>
        </div>

        <Button
          variant="default"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleOpenCreateModal}
        >
          Onboard Vendor
        </Button>
      </div>

      {/* Filter Bar */}
      <VendorFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        tier={tier}
        onTierChange={handleTierChange}
        category={category}
        onCategoryChange={handleCategoryChange}
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
        emptyTitle="No vendors found"
        emptyDescription="No registered local vendors match your current query or filters."
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
      <VendorBulkActionsToolbar
        selectedCount={selectedKeys.length}
        onBulkActivate={handleBulkActivate}
        onBulkSuspend={handleBulkSuspend}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedKeys([])}
        isLoading={bulkActionMutation.isPending}
      />

      {/* Create / Edit Form Modal */}
      <VendorFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        vendorToEdit={vendorToEdit}
      />

      {/* View Details / Profile Drawer */}
      <VendorProfileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectOwner={(ownerName) => setSelectedOwnerId(ownerName)}
        vendor={vendorToView}
      />

      {/* Owner Profile Details CRM Drawer */}
      <PeopleDetailsDrawer
        isOpen={!!selectedOwnerId}
        onClose={() => setSelectedOwnerId(null)}
        personId={selectedOwnerId}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(vendorToDelete)}
        onClose={() => setVendorToDelete(null)}
        size="sm"
        title={
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Confirm Vendor Deletion</span>
          </div>
        }
      >
        <div className="space-y-4 py-2 font-body text-sm text-[var(--foreground)]">
          <p>
            Are you sure you want to delete vendor{' '}
            <strong className="font-semibold text-[var(--foreground)]">{vendorToDelete?.storeName}</strong>? All store records, GST details, and business hours will be permanently removed.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button variant="outline" onClick={() => setVendorToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              Delete Vendor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
