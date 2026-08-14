import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import { useToast } from '../../context/ToastContext';
import type { UserFilterCriteria, SavedUserFilterPreset } from '../../types/user.types';
import {
  Filter,
  RotateCcw,
  Search,
  Bookmark,
  CheckSquare,
  Square,
  Calendar,
  Building2,
  ShieldCheck,
  Headphones,
  ShoppingBag,
  IndianRupee,
  Clock,
  Home,
} from 'lucide-react';

export interface UserFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: UserFilterCriteria;
  onApplyFilters: (newCriteria: UserFilterCriteria) => void;
  onResetFilters: () => void;
  societiesList?: string[];
}

const DEFAULT_CRITERIA: UserFilterCriteria = {
  search: '',
  statuses: [],
  societies: [],
  apartmentBlock: '',
  regDateFrom: '',
  regDateTo: '',
  lastActiveRange: 'all',
  verificationStatus: 'all',
  complaintsRange: 'all',
  minSpend: '',
  maxSpend: '',
  minOrders: '',
};

export const UserFilterModal: React.FC<UserFilterModalProps> = ({
  isOpen,
  onClose,
  criteria,
  onApplyFilters,
  onResetFilters,
  societiesList = ['Anupam Society', 'Greenwood Heights', 'Prestige Heights', 'Sunrise Apartments'],
}) => {
  const { addToast } = useToast();

  const [localCriteria, setLocalCriteria] = useState<UserFilterCriteria>(criteria);
  const [savedPresets, setSavedPresets] = useState<SavedUserFilterPreset[]>(() => {
    try {
      const stored = localStorage.getItem('user_advanced_filter_presets');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'p-1',
        name: 'High Value Active Users (Spend > ₹20k)',
        criteria: {
          ...DEFAULT_CRITERIA,
          statuses: ['active'],
          minSpend: 20000,
        },
      },
      {
        id: 'p-2',
        name: 'Anupam Society Residents',
        criteria: {
          ...DEFAULT_CRITERIA,
          societies: ['Anupam Society'],
        },
      },
      {
        id: 'p-3',
        name: 'Warned / Banned Accounts',
        criteria: {
          ...DEFAULT_CRITERIA,
          statuses: ['warned', 'banned'],
        },
      },
    ];
  });

  const [presetNameInput, setPresetNameInput] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  // Status Multi-Select Toggle
  const toggleStatus = (status: string) => {
    setLocalCriteria((prev) => {
      const exists = prev.statuses.includes(status);
      const updated = exists ? prev.statuses.filter((s) => s !== status) : [...prev.statuses, status];
      return { ...prev, statuses: updated };
    });
  };

  // Society Multi-Select Toggle
  const toggleSociety = (society: string) => {
    setLocalCriteria((prev) => {
      const exists = prev.societies.includes(society);
      const updated = exists ? prev.societies.filter((s) => s !== society) : [...prev.societies, society];
      return { ...prev, societies: updated };
    });
  };

  // Submit Filter Handler
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localCriteria);
    onClose();
  };

  // Reset Filters Handler
  const handleReset = () => {
    setLocalCriteria(DEFAULT_CRITERIA);
    onResetFilters();
    onClose();
  };

  // Save Preset Handler
  const handleSavePreset = () => {
    if (!presetNameInput.trim()) return;
    const newPreset: SavedUserFilterPreset = {
      id: `preset-${Date.now()}`,
      name: presetNameInput.trim(),
      criteria: localCriteria,
    };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    try {
      localStorage.setItem('user_advanced_filter_presets', JSON.stringify(updated));
    } catch {}
    setPresetNameInput('');
    setIsSavingPreset(false);
    addToast({
      type: 'success',
      title: 'Preset Saved',
      description: `Saved filter preset "${newPreset.name}".`,
    });
  };

  const applyPreset = (preset: SavedUserFilterPreset) => {
    setLocalCriteria(preset.criteria);
    onApplyFilters(preset.criteria);
    addToast({
      type: 'info',
      title: 'Filter Preset Applied',
      description: `Loaded criteria for "${preset.name}".`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced User Directory Filters"
      subtitle="Multi-select filter by status, society, registration date, spend &amp; activity telemetry."
      size="lg"
    >
      <form onSubmit={handleApply} className="flex flex-col gap-5 text-xs">
        {/* Saved Presets Section */}
        <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#18281F] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Bookmark size={13} className="text-[#C4A066]" /> Saved Filter Presets
            </span>
            {!isSavingPreset && (
              <button
                type="button"
                onClick={() => setIsSavingPreset(true)}
                className="text-[11px] font-bold text-[#C4A066] hover:underline cursor-pointer"
              >
                + Save Current Criteria
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {savedPresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 bg-white border border-[#E4DCC9] rounded-lg font-semibold text-[#18281F] hover:border-[#C4A066] hover:bg-[#EFE8D8] transition-all cursor-pointer shadow-2xs"
              >
                {p.name}
              </button>
            ))}
          </div>

          {isSavingPreset && (
            <div className="flex items-center gap-2 pt-2 border-t border-[#E4DCC9]/60">
              <input
                type="text"
                placeholder="Enter preset name (e.g. VIP Anupam Buyers)..."
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                className="p-2 border border-[#E4DCC9] rounded-xl text-xs flex-1 outline-none"
              />
              <Button type="button" size="sm" onClick={handleSavePreset}>
                Save
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsSavingPreset(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* 1. Search Bar */}
        <Input
          label="Multi-Field Text Search"
          placeholder="Search by Full Name, Email, Phone Number, or User ID..."
          leftIcon={<Search size={14} className="text-[#C4A066]" />}
          value={localCriteria.search}
          onChange={(e) => setLocalCriteria((prev) => ({ ...prev, search: e.target.value }))}
        />

        {/* 2 & 3. Status Multi-Select & Society Multi-Select Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Multi-Select */}
          <div className="flex flex-col gap-2 p-3 bg-white border border-[#E4DCC9] rounded-xl">
            <span className="font-bold text-[#18281F] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#C4A066]" /> Account Status (Multi-Select)
            </span>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'active', label: 'Active User' },
                { id: 'warned', label: 'Warned User (1-2 Strikes)' },
                { id: 'banned', label: 'Banned / Blocked Account' },
              ].map((s) => {
                const isSelected = localCriteria.statuses.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleStatus(s.id)}
                    className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-[#FAF9F6]"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-[#C4A066]" />
                    ) : (
                      <Square size={16} className="text-[#6B7C70]" />
                    )}
                    <span className="font-semibold text-[#18281F]">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Society Multi-Select */}
          <div className="flex flex-col gap-2 p-3 bg-white border border-[#E4DCC9] rounded-xl">
            <span className="font-bold text-[#18281F] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 size={13} className="text-[#C4A066]" /> Residential Society (Multi-Select)
            </span>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
              {societiesList.map((soc) => {
                const isSelected = localCriteria.societies.includes(soc);
                return (
                  <div
                    key={soc}
                    onClick={() => toggleSociety(soc)}
                    className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-[#FAF9F6]"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-[#C4A066]" />
                    ) : (
                      <Square size={16} className="text-[#6B7C70]" />
                    )}
                    <span className="font-semibold text-[#18281F] truncate">{soc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4 & 5. Apartment Block & Verification Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Apartment / Unit Block"
            placeholder="e.g. A-108 or Block B..."
            leftIcon={<Home size={14} />}
            value={localCriteria.apartmentBlock}
            onChange={(e) => setLocalCriteria((prev) => ({ ...prev, apartmentBlock: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5 font-bold text-[#18281F]">
            <label className="uppercase tracking-wider text-[11px]">Verification Status</label>
            <select
              value={localCriteria.verificationStatus}
              onChange={(e) => setLocalCriteria((prev) => ({ ...prev, verificationStatus: e.target.value }))}
              className="w-full p-2.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-medium text-[#18281F] outline-none cursor-pointer"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Phone &amp; Residence</option>
              <option value="unverified">Unverified Accounts</option>
            </select>
          </div>
        </div>

        {/* 6. Registration Date Range */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-[#18281F] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Calendar size={13} className="text-[#C4A066]" /> Registration Date Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              value={localCriteria.regDateFrom}
              onChange={(e) => setLocalCriteria((prev) => ({ ...prev, regDateFrom: e.target.value }))}
            />
            <Input
              type="date"
              value={localCriteria.regDateTo}
              onChange={(e) => setLocalCriteria((prev) => ({ ...prev, regDateTo: e.target.value }))}
            />
          </div>
        </div>

        {/* 7 & 8. Last Active & Complaints Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 font-bold text-[#18281F]">
            <label className="uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Clock size={13} className="text-[#C4A066]" /> Last Active Session
            </label>
            <select
              value={localCriteria.lastActiveRange}
              onChange={(e) => setLocalCriteria((prev) => ({ ...prev, lastActiveRange: e.target.value }))}
              className="w-full p-2.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-medium text-[#18281F] outline-none cursor-pointer"
            >
              <option value="all">All Active Sessions</option>
              <option value="24h">Active in Last 24 Hours</option>
              <option value="7d">Active in Last 7 Days</option>
              <option value="30d">Active in Last 30 Days</option>
              <option value="inactive_30d">Inactive &gt; 30 Days</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 font-bold text-[#18281F]">
            <label className="uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Headphones size={13} className="text-[#C4A066]" /> Support Complaints Range
            </label>
            <select
              value={localCriteria.complaintsRange}
              onChange={(e) => setLocalCriteria((prev) => ({ ...prev, complaintsRange: e.target.value }))}
              className="w-full p-2.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs font-medium text-[#18281F] outline-none cursor-pointer"
            >
              <option value="all">Any Complaint History</option>
              <option value="none">Zero Complaints (Clean Record)</option>
              <option value="1_2">1 - 2 Support Complaints</option>
              <option value="3_plus">3+ Complaints (High Risk)</option>
            </select>
          </div>
        </div>

        {/* 9 & 10. Minimum Orders & Total Spend Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Minimum Orders"
            type="number"
            placeholder="e.g. 5 orders"
            leftIcon={<ShoppingBag size={14} />}
            value={localCriteria.minOrders}
            onChange={(e) => setLocalCriteria((prev) => ({ ...prev, minOrders: e.target.value }))}
          />

          <Input
            label="Min Spend (₹)"
            type="number"
            placeholder="₹0"
            leftIcon={<IndianRupee size={14} />}
            value={localCriteria.minSpend}
            onChange={(e) => setLocalCriteria((prev) => ({ ...prev, minSpend: e.target.value }))}
          />

          <Input
            label="Max Spend (₹)"
            type="number"
            placeholder="₹50000"
            leftIcon={<IndianRupee size={14} />}
            value={localCriteria.maxSpend}
            onChange={(e) => setLocalCriteria((prev) => ({ ...prev, maxSpend: e.target.value }))}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E4DCC9]">
          <Button
            type="button"
            variant="ghost"
            leftIcon={<RotateCcw size={14} />}
            onClick={handleReset}
          >
            Reset All Filters
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
