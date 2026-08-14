import React from 'react';
import { Search, Filter, CheckCheck, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { NotificationCategory, ReadStatusFilter } from '../../types/notification';

export interface NotificationFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: NotificationCategory | 'all';
  onCategoryChange: (cat: NotificationCategory | 'all') => void;
  readStatus: ReadStatusFilter;
  onReadStatusChange: (status: ReadStatusFilter) => void;
  onMarkAllAsRead: () => void;
  onClearFilters: () => void;
  isMarkingAll?: boolean;
}

export const NotificationFilterBar: React.FC<NotificationFilterBarProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  readStatus,
  onReadStatusChange,
  onMarkAllAsRead,
  onClearFilters,
  isMarkingAll = false,
}) => {
  const hasActiveFilters = search || category !== 'all' || readStatus !== 'all';

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <Input
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-[var(--muted-foreground)]" />}
        />
      </div>

      {/* Category, Status & Mark All Action */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[var(--gold)]" />
          <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">FILTERS:</span>
        </div>

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as NotificationCategory | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Categories</option>
          <option value="vendor_registration">Vendor Onboarding</option>
          <option value="subscription_expiry">Subscription Expiry</option>
          <option value="payment_success">Payment Success</option>
          <option value="payment_failure">Payment Failure</option>
          <option value="announcement">Announcements</option>
        </select>

        {/* Read Status Dropdown */}
        <select
          value={readStatus}
          onChange={(e) => onReadStatusChange(e.target.value as ReadStatusFilter)}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Statuses</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
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
          isLoading={isMarkingAll}
          leftIcon={<CheckCheck className="h-3.5 w-3.5 text-emerald-600" />}
          onClick={onMarkAllAsRead}
        >
          Mark All Read
        </Button>
      </div>
    </div>
  );
};
