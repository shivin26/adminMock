import React, { useState } from 'react';
import { ShieldCheck, Eye, RefreshCw } from 'lucide-react';
import { useAuditLogs, useExportAuditLog } from '../../hooks/useAuditLogs';
import { AuditLogEntry, AuditActionType } from '../../types/audit';
import { ColumnDef, TableAction } from '../../types/table';
import { DataTable } from '../../components/data-table/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/feedback/ErrorState';
import { AuditFilterBar } from '../../components/audit/AuditFilterBar';
import { AuditLogDetailsDrawer } from '../../components/audit/AuditLogDetailsDrawer';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';

export const AuditLogPage: React.FC = () => {
  // Query Filter States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<AuditActionType | 'all'>('all');
  const [adminName, setAdminName] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  // Drawer Selection State
  const [entryToView, setEntryToView] = useState<AuditLogEntry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // TanStack Query Hooks
  const { data, isLoading, isError, refetch } = useAuditLogs({
    page,
    limit,
    search: debouncedSearch,
    action,
    adminName,
  });

  const exportMutation = useExportAuditLog();

  // Filter Reset Handlers
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleActionChange = (val: AuditActionType | 'all') => {
    setAction(val);
    setPage(1);
  };

  const handleAdminNameChange = (val: string) => {
    setAdminName(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setAction('all');
    setAdminName('');
    setPage(1);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    exportMutation.mutate({ format, action: action === 'all' ? undefined : action });
  };

  const handleOpenViewDrawer = (entry: AuditLogEntry) => {
    setEntryToView(entry);
    setIsDrawerOpen(true);
  };

  const getActionBadgeVariant = (act: string) => {
    if (act.includes('SUSPENDED') || act.includes('DELETED')) return 'destructive' as const;
    if (act.includes('CREATED') || act.includes('ACTIVATED')) return 'forest' as const;
    if (act.includes('RENEWED') || act.includes('UPDATED')) return 'gold' as const;
    return 'secondary' as const;
  };

  // Table Columns Definition
  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      key: 'adminName',
      header: 'Administrator',
      sortable: true,
      accessor: (row) => (
        <div>
          <button
            onClick={() => handleOpenViewDrawer(row)}
            className="font-serif font-bold text-sm text-[var(--foreground)] hover:text-[var(--gold)] text-left transition cursor-pointer"
          >
            {row.adminName}
          </button>
          <div className="font-mono text-[10px] text-[var(--muted-foreground)]">
            {row.adminEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action Event',
      sortable: true,
      accessor: (row) => (
        <Badge variant={getActionBadgeVariant(row.action)} className="font-mono text-[10px]">
          {row.action}
        </Badge>
      ),
    },
    {
      key: 'affectedResource',
      header: 'Impacted Entity',
      sortable: true,
      accessor: (row) => (
        <span className="font-body text-xs font-semibold text-[var(--foreground)]">
          {row.affectedResource}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Client IP & Browser',
      sortable: true,
      accessor: (row) => (
        <div className="font-mono text-xs text-[var(--foreground)]">
          <div>{row.ipAddress}</div>
          <div className="text-[10px] text-[var(--muted-foreground)] truncate max-w-xs">{row.browser}</div>
        </div>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      accessor: (row) => (
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {formatDate(row.timestamp)}
        </span>
      ),
    },
  ];

  // Table Row Actions Definition
  const actions: TableAction<AuditLogEntry>[] = [
    {
      label: 'View State Diff',
      icon: <Eye className="h-3.5 w-3.5" />,
      onClick: (row) => handleOpenViewDrawer(row),
    },
  ];

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Failed to load Audit Logs"
          description="There was a problem retrieving compliance audit entries. Please check your connection and retry."
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
            <ShieldCheck className="h-5 w-5 text-[var(--gold)]" />
            <span className="font-mono-meta text-xs text-[var(--gold)] font-semibold">
              COMPLIANCE AUDIT TRAIL
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Audit Logs & Security Trail
          </h1>
          <p className="text-sm font-body text-[var(--muted-foreground)] mt-1">
            Immutably log administrator actions, IP addresses, client browsers, impacted entities, and state diffs.
          </p>
        </div>

        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()}>
          Sync Audit Logs
        </Button>
      </div>

      {/* Filter Bar */}
      <AuditFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        action={action}
        onActionChange={handleActionChange}
        adminName={adminName}
        onAdminNameChange={handleAdminNameChange}
        onExport={handleExport}
        onClearFilters={handleClearFilters}
        isExporting={exportMutation.isPending}
      />

      {/* Reusable Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        searchable={false}
        actions={actions}
        emptyTitle="No audit logs found"
        emptyDescription="No compliance audit entries match your current search query or action filters."
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
      <AuditLogDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        auditEntry={entryToView}
      />
    </div>
  );
};
