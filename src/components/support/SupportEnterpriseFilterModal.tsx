import React, { useState } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Button } from '../common/Button/Button';
import {
  Filter,
  RotateCcw,
  Bookmark,
  Clock,
  AlertTriangle,
  Paperclip,
  Flame,
  Star,
  Plus,
} from 'lucide-react';

export interface FilterState {
  status: string[];
  priority: string[];
  category: string[];
  userType: string[];
  assignedTo: string[];
  vendorStore: string;
  society: string;
  reporter: string;
  source: string;
  slaStatus: string;
  escalatedOnly: boolean;
  hasAttachmentsOnly: boolean;
  unreadOnly: boolean;
  favoritesOnly: boolean;
  quickDateRange: 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export const INITIAL_FILTER_STATE: FilterState = {
  status: [],
  priority: [],
  category: [],
  userType: [],
  assignedTo: [],
  vendorStore: 'all',
  society: 'all',
  reporter: '',
  source: 'all',
  slaStatus: 'all',
  escalatedOnly: false,
  hasAttachmentsOnly: false,
  unreadOnly: false,
  favoritesOnly: false,
  quickDateRange: 'all',
};

export interface SupportEnterpriseFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
}

export const SupportEnterpriseFilterModal: React.FC<SupportEnterpriseFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);
  const [savedFilterName, setSavedFilterName] = useState('');
  const [savedPresets, setSavedPresets] = useState<Array<{ name: string; state: FilterState }>>([
    {
      name: 'Urgent SLA Escalations',
      state: { ...INITIAL_FILTER_STATE, priority: ['urgent'], escalatedOnly: true },
    },
    {
      name: 'Vendor Billing Disputes',
      state: { ...INITIAL_FILTER_STATE, category: ['billing'], userType: ['vendor'] },
    },
  ]);

  const toggleMultiSelect = (key: keyof FilterState, value: string) => {
    const current = (draftFilters[key] as string[]) || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setDraftFilters({ ...draftFilters, [key]: next });
  };

  const handleReset = () => {
    setDraftFilters(INITIAL_FILTER_STATE);
  };

  const handleApply = () => {
    onApplyFilters(draftFilters);
    onClose();
  };

  const handleSavePreset = () => {
    if (!savedFilterName.trim()) return;
    setSavedPresets([
      ...savedPresets,
      { name: savedFilterName.trim(), state: draftFilters },
    ]);
    setSavedFilterName('');
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Enterprise Support Filters"
      subtitle="Filter ticket queues by SLA deadlines, user types, categories, escalation flags, and custom date ranges."
      size="xl"
    >
      <div className="flex flex-col gap-5 max-h-[72vh] overflow-y-auto pr-1">
        {/* Quick Presets Bar */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={13} className="text-[#C8A878]" /> Quick Time Range Presets
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'all', label: 'All Time' },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  draftFilters.quickDateRange === preset.id
                    ? 'bg-[#211A19] text-white shadow-sm'
                    : 'bg-[#FAF8F5] border border-[#E7DFD5] text-[#78716C] hover:bg-[#EEE5DA]'
                }`}
                onClick={() => setDraftFilters({ ...draftFilters, quickDateRange: preset.id as any })}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Toggles: Escalated, Attachments, Unread, Favorites */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              draftFilters.escalatedOnly
                ? 'bg-rose-50 border-rose-500 text-rose-700'
                : 'bg-white border-[#E7DFD5] text-[#78716C]'
            }`}
            onClick={() => setDraftFilters({ ...draftFilters, escalatedOnly: !draftFilters.escalatedOnly })}
          >
            <Flame size={14} className={draftFilters.escalatedOnly ? 'text-rose-600' : ''} /> Escalated Only
          </button>

          <button
            type="button"
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              draftFilters.hasAttachmentsOnly
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-[#E7DFD5] text-[#78716C]'
            }`}
            onClick={() =>
              setDraftFilters({ ...draftFilters, hasAttachmentsOnly: !draftFilters.hasAttachmentsOnly })
            }
          >
            <Paperclip size={14} /> With Attachments
          </button>

          <button
            type="button"
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              draftFilters.unreadOnly
                ? 'bg-amber-50 border-amber-500 text-amber-700'
                : 'bg-white border-[#E7DFD5] text-[#78716C]'
            }`}
            onClick={() => setDraftFilters({ ...draftFilters, unreadOnly: !draftFilters.unreadOnly })}
          >
            <AlertTriangle size={14} /> Unread Inquiries
          </button>

          <button
            type="button"
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              draftFilters.favoritesOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-[#E7DFD5] text-[#78716C]'
            }`}
            onClick={() => setDraftFilters({ ...draftFilters, favoritesOnly: !draftFilters.favoritesOnly })}
          >
            <Star size={14} /> Bookmarked
          </button>
        </div>

        {/* Multi-Select Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#E7DFD5]/60 pt-4">
          {/* Status Multi-Select */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#211A19]">Status:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['open', 'in_progress', 'resolved', 'closed'].map((st) => (
                <label
                  key={st}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                    draftFilters.status.includes(st)
                      ? 'bg-[#211A19] text-white border-[#211A19]'
                      : 'bg-[#FAF8F5] border-[#E7DFD5] text-[#78716C]'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={draftFilters.status.includes(st)}
                    onChange={() => toggleMultiSelect('status', st)}
                  />
                  {st.replace('_', ' ').toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Priority Multi-Select */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#211A19]">Priority Level:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['urgent', 'high', 'medium', 'low'].map((pr) => (
                <label
                  key={pr}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                    draftFilters.priority.includes(pr)
                      ? 'bg-[#211A19] text-white border-[#211A19]'
                      : 'bg-[#FAF8F5] border-[#E7DFD5] text-[#78716C]'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={draftFilters.priority.includes(pr)}
                    onChange={() => toggleMultiSelect('priority', pr)}
                  />
                  {pr.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Category Multi-Select */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#211A19]">Category:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['technical', 'billing', 'onboarding', 'general'].map((cat) => (
                <label
                  key={cat}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                    draftFilters.category.includes(cat)
                      ? 'bg-[#211A19] text-white border-[#211A19]'
                      : 'bg-[#FAF8F5] border-[#E7DFD5] text-[#78716C]'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={draftFilters.category.includes(cat)}
                    onChange={() => toggleMultiSelect('category', cat)}
                  />
                  {cat.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Ticket Type Multi-Select */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#211A19]">Reporter Type:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['user', 'vendor', 'user_vendor'].map((typ) => (
                <label
                  key={typ}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border transition-all ${
                    draftFilters.userType.includes(typ)
                      ? 'bg-[#211A19] text-white border-[#211A19]'
                      : 'bg-[#FAF8F5] border-[#E7DFD5] text-[#78716C]'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={draftFilters.userType.includes(typ)}
                    onChange={() => toggleMultiSelect('userType', typ)}
                  />
                  {typ === 'user_vendor' ? 'USER & VENDOR' : typ.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Dropdowns Row: Assigned To, Source, SLA Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#E7DFD5]/60 pt-4 text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#211A19]">Assigned Agent:</label>
            <select
              value={draftFilters.assignedTo[0] || 'all'}
              onChange={(e) =>
                setDraftFilters({
                  ...draftFilters,
                  assignedTo: e.target.value === 'all' ? [] : [e.target.value],
                })
              }
              className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-medium text-[#211A19] outline-none"
            >
              <option value="all">All Agents</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Vikram Mehta">Vikram Mehta</option>
              <option value="Ananya Sharma">Ananya Sharma</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#211A19]">Inquiry Source:</label>
            <select
              value={draftFilters.source}
              onChange={(e) => setDraftFilters({ ...draftFilters, source: e.target.value })}
              className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-medium text-[#211A19] outline-none"
            >
              <option value="all">All Origin Channels</option>
              <option value="landing_website">Resident Website Intake (landing_website)</option>
              <option value="vendor_portal">Vendor Web Portal (vendor_portal)</option>
              <option value="mobile_app">Vendor Mobile App (mobile_app)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#211A19]">SLA Status:</label>
            <select
              value={draftFilters.slaStatus}
              onChange={(e) => setDraftFilters({ ...draftFilters, slaStatus: e.target.value })}
              className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-medium text-[#211A19] outline-none"
            >
              <option value="all">All SLA States</option>
              <option value="compliant">SLA Compliant</option>
              <option value="at_risk">SLA At Risk (&lt; 60m)</option>
              <option value="breached">SLA Breached</option>
            </select>
          </div>
        </div>

        {/* Saved Filter Presets Section */}
        <div className="border-t border-[#E7DFD5]/60 pt-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-[#211A19] flex items-center gap-1.5">
            <Bookmark size={13} className="text-[#C8A878]" /> Saved Filter Presets
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {savedPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E7DFD5] hover:border-[#C8A878] rounded-xl text-xs font-bold text-[#211A19] flex items-center gap-1"
                onClick={() => setDraftFilters(p.state)}
              >
                <Bookmark size={11} className="text-[#C8A878]" /> {p.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              placeholder="Save active filters as preset name..."
              value={savedFilterName}
              onChange={(e) => setSavedFilterName(e.target.value)}
              className="flex-1 p-2 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs outline-none"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus size={12} />}
              onClick={handleSavePreset}
              disabled={!savedFilterName.trim()}
            >
              Save Preset
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E7DFD5] mt-2">
        <Button
          type="button"
          variant="ghost"
          leftIcon={<RotateCcw size={14} />}
          onClick={handleReset}
        >
          Reset All
        </Button>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            leftIcon={<Filter size={14} />}
            onClick={handleApply}
          >
            Apply Enterprise Filters
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
