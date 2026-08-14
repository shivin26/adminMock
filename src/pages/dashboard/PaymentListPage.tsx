import React, { useState } from 'react';
import { CreditCard, Eye, RefreshCw, Download, FileCheck } from 'lucide-react';
import {
  usePayments,
  useRevenueDashboard,
  useDownloadReceipt,
  useDownloadInvoice,
} from '../../hooks/usePayment';
import { PaymentTransaction, PaymentStatus, PaymentGatewayMethod } from '../../types/payment';
import { ColumnDef, TableAction } from '../../types/table';
import { DataTable } from '../../components/data-table/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { RevenueDashboardCharts } from '../../components/payment/RevenueDashboardCharts';
import { PaymentFilterBar } from '../../components/payment/PaymentFilterBar';
import { TransactionDetailsDrawer } from '../../components/payment/TransactionDetailsDrawer';
import { IssueRefundModal } from '../../components/payment/IssueRefundModal';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const PaymentListPage: React.FC = () => {
  // Query Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | 'all'>('all');
  const [gatewayMethod, setGatewayMethod] = useState<PaymentGatewayMethod | 'all'>('all');

  const debouncedSearch = useDebounce(search, 300);

  // Drawer / Modal States
  const [transactionToView, setTransactionToView] = useState<PaymentTransaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [transactionToRefund, setTransactionToRefund] = useState<PaymentTransaction | null>(null);

  // TanStack Query Hooks
  const { data, isLoading, isError, refetch } = usePayments({
    page,
    limit,
    search: debouncedSearch,
    status,
    gatewayMethod,
  });

  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenueDashboard();
  const downloadReceiptMutation = useDownloadReceipt();
  const downloadInvoiceMutation = useDownloadInvoice();

  // Filter Reset Handlers
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: PaymentStatus | 'all') => {
    setStatus(val);
    setPage(1);
  };

  const handleGatewayChange = (val: PaymentGatewayMethod | 'all') => {
    setGatewayMethod(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setGatewayMethod('all');
    setPage(1);
  };

  // Row Action Handlers
  const handleOpenViewDrawer = (txn: PaymentTransaction) => {
    setTransactionToView(txn);
    setIsDrawerOpen(true);
  };

  // Table Columns Definition
  const columns: ColumnDef<PaymentTransaction>[] = [
    {
      key: 'id',
      header: 'Transaction & Merchant',
      sortable: true,
      accessor: (row) => (
        <div>
          <button
            onClick={() => handleOpenViewDrawer(row)}
            className="font-serif font-bold text-sm text-[var(--foreground)] hover:text-[var(--gold)] text-left transition cursor-pointer"
          >
            {row.id}
          </button>
          <div className="font-mono text-[10px] text-[var(--gold)] font-semibold mt-0.5">
            {row.storeName}
          </div>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      accessor: (row) => (
        <div className="font-body text-xs text-[var(--foreground)]">
          <div>{row.customerName}</div>
          <div className="font-mono text-[10px] text-[var(--muted-foreground)]">{row.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Gross & Fee',
      sortable: true,
      align: 'right',
      accessor: (row) => (
        <div className="text-right">
          <div className="font-mono font-bold text-sm text-[var(--foreground)]">
            {formatCurrency(row.amount)}
          </div>
          <div className="font-mono text-[10px] text-emerald-700 font-semibold">
            +Fee: {formatCurrency(row.platformFee)}
          </div>
        </div>
      ),
    },
    {
      key: 'gatewayMethod',
      header: 'Gateway',
      sortable: true,
      accessor: (row) => (
        <Badge variant="outline" className="uppercase font-mono text-[10px]">
          {row.gatewayMethod.replace('_', ' ')}
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
            row.status === 'success'
              ? 'forest'
              : row.status === 'refunded'
              ? 'gold'
              : row.status === 'pending'
              ? 'warning'
              : 'destructive'
          }
          className="capitalize"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Transaction Date',
      sortable: true,
      accessor: (row) => (
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {formatDate(row.date)}
        </span>
      ),
    },
  ];

  // Table Row Actions Definition
  const actions: TableAction<PaymentTransaction>[] = [
    {
      label: 'View',
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (row) => handleOpenViewDrawer(row),
    },
    {
      label: 'Receipt',
      icon: <Download className="h-3.5 w-3.5" />,
      onClick: (row) => downloadReceiptMutation.mutate(row.id),
    },
    {
      label: 'Invoice',
      icon: <FileCheck className="h-3.5 w-3.5" />,
      onClick: (row) => downloadInvoiceMutation.mutate(row.id),
    },
    {
      label: 'Refund',
      variant: 'destructive',
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      onClick: (row) => setTransactionToRefund(row),
    },
  ];

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load Payments"
          description="There was a problem fetching the payment transaction ledger. Please check your connection and retry."
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
              TRANSACTION LEDGER
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Payment Management
          </h1>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1">
            Track gateway transactions, gross volume, 5% platform fees, receipts, invoices, and process refunds.
          </p>
        </div>

        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
          Sync Ledger
        </Button>
      </div>

      {/* Revenue Dashboard Analytics */}
      <RevenueDashboardCharts data={revenueData} isLoading={isLoadingRevenue} />

      {/* Filter Bar */}
      <PaymentFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        gatewayMethod={gatewayMethod}
        onGatewayMethodChange={handleGatewayChange}
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
        emptyTitle="No payments found"
        emptyDescription="No payment transactions match your current query or filters."
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
      <TransactionDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transaction={transactionToView}
        onOpenRefundModal={(txn) => {
          setIsDrawerOpen(false);
          setTransactionToRefund(txn);
        }}
      />

      {/* Issue Refund Modal */}
      <IssueRefundModal
        isOpen={Boolean(transactionToRefund)}
        onClose={() => setTransactionToRefund(null)}
        transaction={transactionToRefund}
      />
    </div>
  );
};
