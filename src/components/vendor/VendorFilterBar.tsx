import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { VendorStatus, SubscriptionTier } from '../../types/vendor';

export interface VendorFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: VendorStatus | 'all';
  onStatusChange: (status: VendorStatus | 'all') => void;
  tier: SubscriptionTier | 'all';
  onTierChange: (tier: SubscriptionTier | 'all') => void;
  category: string;
  onCategoryChange: (category: string) => void;
  availableCategories?: string[];
  onClearFilters: () => void;
}

export const VendorFilterBar: React.FC<VendorFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  tier,
  onTierChange,
  category,
  onCategoryChange,
  availableCategories = [
    'Grocery',
    'Bakery & Food',
    'Home & Living',
    'Florist & Decor',
    'Sports & Adventure',
  ],
  onClearFilters,
}) => {
  const hasActiveFilters = search || status !== 'all' || tier !== 'all' || category !== '';

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <Input
          placeholder="Search by store, owner, or GSTIN..."
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
          onChange={(e) => onStatusChange(e.target.value as VendorStatus | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="suspended">Suspended Only</option>
          <option value="pending_approval">Pending Approval</option>
        </select>

        {/* Tier Dropdown */}
        <select
          value={tier}
          onChange={(e) => onTierChange(e.target.value as SubscriptionTier | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Tiers</option>
          <option value="free">Free Starter</option>
          <option value="pro">Pro Vendor</option>
          <option value="enterprise">Enterprise Tier</option>
        </select>

        {/* Category Dropdown */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="">All Categories</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>
              {c}
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
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
