import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SubscriptionStatus, SubscriptionPlan, BillingCycle } from '../../types/subscription';

export interface SubscriptionFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: SubscriptionStatus | 'all';
  onStatusChange: (status: SubscriptionStatus | 'all') => void;
  plan: SubscriptionPlan | 'all';
  onPlanChange: (plan: SubscriptionPlan | 'all') => void;
  billingCycle: BillingCycle | 'all';
  onBillingCycleChange: (cycle: BillingCycle | 'all') => void;
  onClearFilters: () => void;
}

export const SubscriptionFilterBar: React.FC<SubscriptionFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  plan,
  onPlanChange,
  billingCycle,
  onBillingCycleChange,
  onClearFilters,
}) => {
  const hasActiveFilters = search || status !== 'all' || plan !== 'all' || billingCycle !== 'all';

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <Input
          placeholder="Search by store name, vendor, or ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-[var(--muted-foreground)]" />}
        />
      </div>

      {/* Filter Selects & Clear */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[var(--gold)]" />
          <span className="font-mono-meta text-[10px] text-[var(--muted-foreground)]">FILTERS:</span>
        </div>

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as SubscriptionStatus | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="expiring_soon">Expiring Soon (≤ 7 days)</option>
          <option value="overdue">Overdue Only</option>
          <option value="cancelled">Cancelled Only</option>
        </select>

        {/* Plan Dropdown */}
        <select
          value={plan}
          onChange={(e) => onPlanChange(e.target.value as SubscriptionPlan | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Plans</option>
          <option value="free">Free Starter</option>
          <option value="pro">Pro Vendor</option>
          <option value="enterprise">Enterprise Tier</option>
        </select>

        {/* Billing Cycle Dropdown */}
        <select
          value={billingCycle}
          onChange={(e) => onBillingCycleChange(e.target.value as BillingCycle | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Cycles</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            leftIcon={<X className="h-3.5 w-3.5" />}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
