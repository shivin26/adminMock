import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import type { PeopleFilterOptions } from '../../types/people.types';
import { Filter, RotateCcw } from 'lucide-react';

export interface PeopleFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PeopleFilterOptions;
  onApplyFilters: (newFilters: PeopleFilterOptions) => void;
  onResetFilters: () => void;
}

export const PeopleFilterModal: React.FC<PeopleFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [personType, setPersonType] = useState(filters.personType || 'all');
  const [status, setStatus] = useState(filters.status || 'all');
  const [societyName, setSocietyName] = useState(filters.societyName || 'all');
  const [minFlags, setMinFlags] = useState(filters.minFlags || 0);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters({
      ...filters,
      personType,
      status,
      societyName,
      minFlags,
    });
    onClose();
  };

  const handleReset = () => {
    setPersonType('all');
    setStatus('all');
    setSocietyName('all');
    setMinFlags(0);
    onResetFilters();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Directory Filters"
      subtitle="Refine search by role, account status, society, or strike threshold."
    >
      <form onSubmit={handleApply} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 text-xs font-bold text-[#211A19]">
            <label className="uppercase tracking-wider">Account Role / Type</label>
            <select
              value={personType}
              onChange={(e) => setPersonType(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-medium text-[#211A19] outline-none cursor-pointer"
            >
              <option value="all">All Users (Resident &amp; Dual Role)</option>
              <option value="user">Resident Customers Only</option>
              <option value="user_vendor">User &amp; Vendor Dual Role</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-bold text-[#211A19]">
            <label className="uppercase tracking-wider">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-medium text-[#211A19] outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="warned">Warned Accounts (1-2 Strikes)</option>
              <option value="banned">Banned / Blocked (3 Strikes)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 text-xs font-bold text-[#211A19]">
            <label className="uppercase tracking-wider">Residential Society</label>
            <select
              value={societyName}
              onChange={(e) => setSocietyName(e.target.value)}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-medium text-[#211A19] outline-none cursor-pointer"
            >
              <option value="all">All Societies</option>
              <option value="Anupam Society">Anupam Society</option>
              <option value="Greenwood Heights Society">Greenwood Heights Society</option>
              <option value="Sunrise Apartments">Sunrise Apartments</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-bold text-[#211A19]">
            <label className="uppercase tracking-wider">Minimum Strike Flags</label>
            <select
              value={minFlags}
              onChange={(e) => setMinFlags(Number(e.target.value))}
              className="w-full p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-medium text-[#211A19] outline-none cursor-pointer"
            >
              <option value={0}>Any Flags (0+)</option>
              <option value={1}>At least 1 Strike Flag</option>
              <option value={2}>At least 2 Strike Flags</option>
              <option value={3}>3 Strikes (Auto-Banned)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#E7DFD5]">
          <Button
            type="button"
            variant="ghost"
            leftIcon={<RotateCcw size={14} />}
            onClick={handleReset}
          >
            Reset Filters
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" leftIcon={<Filter size={14} />}>
              Apply Filters
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
