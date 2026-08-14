import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PaymentStatus, PaymentGatewayMethod } from '../../types/payment';

export interface PaymentFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: PaymentStatus | 'all';
  onStatusChange: (status: PaymentStatus | 'all') => void;
  gatewayMethod: PaymentGatewayMethod | 'all';
  onGatewayMethodChange: (gateway: PaymentGatewayMethod | 'all') => void;
  onClearFilters: () => void;
}

export const PaymentFilterBar: React.FC<PaymentFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  gatewayMethod,
  onGatewayMethodChange,
  onClearFilters,
}) => {
  const hasActiveFilters = search || status !== 'all' || gatewayMethod !== 'all';

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <Input
          placeholder="Search transaction ID, store, customer..."
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
          onChange={(e) => onStatusChange(e.target.value as PaymentStatus | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Statuses</option>
          <option value="success">Success Only</option>
          <option value="pending">Pending Only</option>
          <option value="failed">Failed Only</option>
          <option value="refunded">Refunded Only</option>
        </select>

        {/* Gateway Dropdown */}
        <select
          value={gatewayMethod}
          onChange={(e) => onGatewayMethodChange(e.target.value as PaymentGatewayMethod | 'all')}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-body text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="all">All Gateways</option>
          <option value="stripe">Stripe Direct</option>
          <option value="razorpay">Razorpay</option>
          <option value="bank_transfer">Bank Transfer (ACH)</option>
          <option value="digiwallet">DigiWallet</option>
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
