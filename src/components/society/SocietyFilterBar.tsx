import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SocietyStatus } from '../../types/society';

export interface SocietyFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: SocietyStatus | 'all';
  onStatusChange: (status: SocietyStatus | 'all') => void;
  city: string;
  onCityChange: (city: string) => void;
  availableCities?: string[];
  onClearFilters: () => void;
}

export const SocietyFilterBar: React.FC<SocietyFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  city,
  onCityChange,
  availableCities = ['Metropolis', 'Springfield', 'San Jose'],
  onClearFilters,
}) => {
  const hasActiveFilters = search || status !== 'all' || city !== '';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Input
          placeholder="Search by name, code, or city..."
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
          onChange={(e) => onStatusChange(e.target.value as SocietyStatus | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        {/* City Dropdown */}
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="">All Cities</option>
          {availableCities.map((c) => (
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
