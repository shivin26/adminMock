import React, { useState } from 'react';
import { CreditCard, Eye, RefreshCw, XCircle, Download, AlertTriangle } from 'lucide-react';
import {
  useSubscriptions,
  useSubscriptionAnalytics,
  useDownloadInvoice,
} from '../../hooks/useSubscription';
import { Subscription, SubscriptionStatus, SubscriptionPlan, BillingCycle } from '../../types/subscription';
import { ColumnDef, TableAction } from '../../types/table';
import { DataTable } from '../../components/data-table/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { SubscriptionAnalyticsCharts } from '../../components/subscription/SubscriptionAnalyticsCharts';
import { SubscriptionFilterBar } from '../../components/subscription/SubscriptionFilterBar';
import { SubscriptionDetailsDrawer } from '../../components/subscription/SubscriptionDetailsDrawer';
import { RenewSubscriptionModal } from '../../components/subscription/RenewSubscriptionModal';
import { CancelSubscriptionModal } from '../../components/subscription/CancelSubscriptionModal';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SubscriptionListPage: React.FC = () => {
  // Query Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus | 'all'>('all');
  const [plan, setPlan] = useState<SubscriptionPlan | 'all'>('all');
  const [billingCycle, setBillingCycle] = useState<BillingCycle | 'all'>('all');

  const debouncedSearch = useDebounce(search, 300);

  // Modal / Drawer Selection States
  const [subscriptionToView, setSubscriptionToView] = useState<Subscription | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [subscriptionToRenew, setSubscriptionToRenew] = useState<Subscription | null>(null);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<Subscription | null>(null);

  // TanStack Query Hooks
  const { data, isLoading, isError, refetch } = useSubscriptions({
    page,
    limit,
    search: debouncedSearch,
    status,
    plan,
    billingCycle,
  });

  const { data: analyticsData, isLoading: isLoadingAnalytics } = useSubscriptionAnalytics();
  const downloadInvoiceMutation = useDownloadInvoice();

  // Filter Reset Handlers
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: SubscriptionStatus | 'all') => {
    setStatus(val);
    setPage(1);
  };

  const handlePlanChange = (val: SubscriptionPlan | 'all') => {
    setPlan(val);
    setPage(1);
  };

  const handleBillingCycleChange = (val: BillingCycle | 'all') => {
    setBillingCycle(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setPlan('all');
    setBillingCycle('all');
    setPage(1);
  };

  // Row Action Handlers
  const handleOpenViewDrawer = (sub: Subscription) => {
    setSubscriptionToView(sub);
    setIsDrawerOpen(true);
  };

  // Table Columns Definition
  const columns: ColumnDef<Subscription>[] = [
    {
      key: 'storeName',
      header: 'Store & Subscription ID',
      sortable: true,
      accessor: (row) => (
        <div>
          <button
            onClick={() => handleOpenViewDrawer(row)}
            className="font-serif font-bold text-sm text-[var(--foreground)] hover:text-[var(--gold)] text-left transition cursor-pointer"
          >
            {row.storeName}
          </button>
          <div className="font-mono text-[10px] text-[var(--gold)] font-semibold mt-0.5">
            {row.id} • {row.vendorName}
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan & Billing',
      sortable: true,
      accessor: (row) => (
        <div>
          <Badge variant={row.plan === 'enterprise' ? 'gold' : 'outline'} className="capitalize">
            {row.plan} Tier
          </Badge>
          <div className="font-mono text-[10px] text-[var(--muted-foreground)] mt-1 capitalize">
            {row.billingCycle} ({formatCurrency(row.price)})
          </div>
        </div>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Expiry & Remaining',
      sortable: true,
      accessor: (row) => {
        const isExpiringSoon = row.remainingDays <= 7 && row.status !== 'cancelled';

        return (
          <div>
            <div className="font-mono text-xs text-[var(--foreground)]">
              {formatDate(row.expiryDate)}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`font-mono text-[10px] font-bold ${
                  isExpiringSoon ? 'text-amber-600' : 'text-[var(--muted-foreground)]'
                }`}
              >
                {row.remainingDays} days remaining
              </span>
              {isExpiringSoon && <AlertTriangle className="h-3 w-3 text-amber-600" />}
            </div>
          </div>
        );
      },
    },
    {
      key: 'paymentStatus',
      header: 'Payment Status',
      sortable: true,
      accessor: (row) => (
        <Badge
          variant={
            row.paymentStatus === 'paid'
              ? 'forest'
              : row.paymentStatus === 'pending'
              ? 'warning'
              : 'destructive'
          }
          className="capitalize"
        >
          {row.paymentStatus}
        </Badge>
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
              : row.status === 'expiring_soon'
              ? 'gold'
              : 'destructive'
          }
          className="capitalize"
        >
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
  ];

  // Table Row Actions Definition
  const actions: TableAction<Subscription>[] = [
    {
      label: 'View',
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (row) => handleOpenViewDrawer(row),
    },
    {
      label: 'Renew',
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      onClick: (row) => setSubscriptionToRenew(row),
    },
    {
      label: 'Invoice',
      icon: <Download className="h-3.5 w-3.5" />,
      onClick: (row) => downloadInvoiceMutation.mutate(row.id),
    },
    {
      label: 'Cancel',
      variant: 'destructive',
      icon: <XCircle className="h-3.5 w-3.5" />,
      onClick: (row) => setSubscriptionToCancel(row),
    },
  ];

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load Subscriptions"
          description="There was a problem fetching the subscription directory. Please check your connection and retry."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[var(--gold)]" />
            <span className="font-mono-meta text-xs text-[var(--gold)] font-semibold">
              BILLING TELEMETRY
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Subscription Management
          </h1>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1">
            Monitor merchant recurring plans, expiry warnings, renewals, cancellations, and invoice history.
          </p>
        </div>

        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
          Sync Subscriptions
        </Button>
      </div>

      {/* Subscription Analytics Charts */}
      <SubscriptionAnalyticsCharts data={analyticsData} isLoading={isLoadingAnalytics} />

      {/* Filter Bar */}
      <SubscriptionFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        plan={plan}
        onPlanChange={handlePlanChange}
        billingCycle={billingCycle}
        onBillingCycleChange={handleBillingCycleChange}
        onClearFilters={handleClearFilters}
      />

      {/* Reusable Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchable={false}
        actions={actions}
        emptyTitle="No subscriptions found"
        emptyDescription="No vendor subscriptions match your current query or filters."
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

      {/* Details Drawer */}
      <SubscriptionDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        subscription={subscriptionToView}
      />

      {/* Renew Subscription Modal */}
      <RenewSubscriptionModal
        isOpen={Boolean(subscriptionToRenew)}
        onClose={() => setSubscriptionToRenew(null)}
        subscription={subscriptionToRenew}
      />

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal
        isOpen={Boolean(subscriptionToCancel)}
        onClose={() => setSubscriptionToCancel(null)}
        subscription={subscriptionToCancel}
      />
    </div>
  );
};
