import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '../common/Button/Button';

export interface SupportTicketFilterBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  counts: {
    all: number;
    open: number;
    in_progress: number;
    resolved: number;
  };
  onOpenAdvancedFilters?: () => void;
}

export const SupportTicketFilterBar: React.FC<SupportTicketFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  counts,
  onOpenAdvancedFilters,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        <button
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#211A19] text-[#FFFFFF] shadow-sm'
              : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
          }`}
          onClick={() => onTabChange('all')}
        >
          All Tickets ({counts.all})
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'open'
              ? 'bg-[#211A19] text-[#FFFFFF] shadow-sm'
              : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
          }`}
          onClick={() => onTabChange('open')}
        >
          Open ({counts.open})
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'in_progress'
              ? 'bg-[#211A19] text-[#FFFFFF] shadow-sm'
              : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
          }`}
          onClick={() => onTabChange('in_progress')}
        >
          In Progress ({counts.in_progress})
        </button>

        <button
          type="button"
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'resolved'
              ? 'bg-[#211A19] text-[#FFFFFF] shadow-sm'
              : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
          }`}
          onClick={() => onTabChange('resolved')}
        >
          Resolved ({counts.resolved})
        </button>
      </div>

      {/* Right Controls: Category Dropdown, Advanced Filters & Search Bar */}
      <div className="flex items-center gap-2.5 w-full md:w-auto">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-semibold text-[#211A19] outline-none focus:border-[#C8A878]"
        >
          <option value="all">All Categories & Complaints</option>
          <option value="vendor_vs_user">Vendor → Resident Customer Complaint</option>
          <option value="vendor_vs_vendor">Vendor → Vendor (Resident Purchase Complaint)</option>
          <option value="user_vs_vendor">Resident → Vendor Complaint</option>
          <option value="technical">Technical Inquiries</option>
          <option value="billing">Billing & Settlement</option>
          <option value="onboarding">Onboarding & Verification</option>
          <option value="general">General Support</option>
        </select>

        {onOpenAdvancedFilters && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter size={14} />}
            onClick={onOpenAdvancedFilters}
          >
            Filters
          </Button>
        )}

        <div className="relative flex-1 md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search tickets, subject, reporter..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-semibold text-[#211A19] outline-none focus:border-[#C8A878]"
          />
        </div>
      </div>
    </div>
  );
};
