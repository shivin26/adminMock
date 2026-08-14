import React from 'react';
import { Search, Filter, FileCode, FileText, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AuditActionType } from '../../types/audit';

export interface AuditFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  action: AuditActionType | 'all';
  onActionChange: (action: AuditActionType | 'all') => void;
  adminName: string;
  onAdminNameChange: (admin: string) => void;
  availableAdmins?: string[];
  onExport: (format: 'csv' | 'pdf') => void;
  onClearFilters: () => void;
  isExporting?: boolean;
}

export const AuditFilterBar: React.FC<AuditFilterBarProps> = ({
  search,
  onSearchChange,
  action,
  onActionChange,
  adminName,
  onAdminNameChange,
  availableAdmins = ['Alex Vance', 'Sarah Jenkins', 'Marcus Bell'],
  onExport,
  onClearFilters,
  isExporting = false,
}) => {
  const hasActiveFilters = search || action !== 'all' || adminName !== '';

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <Input
          placeholder="Search by Admin, Action, IP, or Entity..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-[var(--muted-foreground)]" />}
        />
      </div>

      {/* Filter Selects & Export Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[var(--gold)]" />
          <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">FILTERS:</span>
        </div>

        {/* Action Dropdown */}
        <select
          value={action}
          onChange={(e) => onActionChange(e.target.value as AuditActionType | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Actions</option>
          <option value="VENDOR_SUSPENDED">Vendor Suspended</option>
          <option value="VENDOR_ACTIVATED">Vendor Activated</option>
          <option value="REFUND_ISSUED">Refund Issued</option>
          <option value="SOCIETY_CREATED">Society Created</option>
          <option value="SUBSCRIPTION_RENEWED">Subscription Renewed</option>
          <option value="SETTINGS_UPDATED">Settings Updated</option>
        </select>

        {/* Admin Dropdown */}
        <select
          value={adminName}
          onChange={(e) => onAdminNameChange(e.target.value)}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="">All Administrators</option>
          {availableAdmins.map((adm) => (
            <option key={adm} value={adm}>
              {adm}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            leftIcon={<X className="h-3.5 w-3.5" />}
          >
            Clear
          </Button>
        )}

        <div className="h-4 w-px bg-[var(--border)] hidden sm:block mx-1" />

        <Button
          variant="outline"
          size="sm"
          isLoading={isExporting}
          leftIcon={<FileCode className="h-3.5 w-3.5 text-emerald-600" />}
          onClick={() => onExport('csv')}
        >
          CSV
        </Button>

        <Button
          variant="default"
          size="sm"
          isLoading={isExporting}
          leftIcon={<FileText className="h-3.5 w-3.5 text-[var(--gold)]" />}
          onClick={() => onExport('pdf')}
        >
          Export PDF
        </Button>
      </div>
    </div>
  );
};
