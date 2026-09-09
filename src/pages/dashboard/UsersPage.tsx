import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { Breadcrumb } from '../../components/layout/Breadcrumb/Breadcrumb';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { PeopleAnalyticsHeader } from '../../components/people/PeopleAnalyticsHeader';
import { PeopleEnterpriseDataTable } from '../../components/people/PeopleEnterpriseDataTable';
import { PeopleFilterModal } from '../../components/people/PeopleFilterModal';
import { PeopleDetailsDrawer } from '../../components/people/PeopleDetailsDrawer';
import { VendorDetailsDrawer } from '../../components/vendors/VendorDetailsDrawer';
import { AddPersonModal } from '../../components/people/AddPersonModal';
import { usePeopleList, useFlagPerson } from '../../hooks/usePeople';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal/Modal';
import type { PeopleFilterOptions, PersonProfile } from '../../types/people.types';
import type { Vendor } from '../../types/vendor.types';
import { Search, Filter, UserPlus, RefreshCw, Users, AlertTriangle, Flag } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<'all' | 'user' | 'user_vendor' | 'flagged'>('all');
  const [filters, setFilters] = useState<PeopleFilterOptions>({
    search: '',
    personType: 'all',
    status: 'all',
    societyName: 'all',
    minFlags: 0,
  });

  const { data: rawPeopleList, isLoading, refetch } = usePeopleList(filters);
  const flagPersonMutation = useFlagPerson();

  const peopleList = Array.isArray(rawPeopleList) ? rawPeopleList : [];

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedVendorForDrawer, setSelectedVendorForDrawer] = useState<Vendor | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalCount = peopleList.length;
  const residentCount = peopleList.filter((p) => p && p.personType === 'user').length;
  const dualRoleCount = peopleList.filter((p) => p && p.personType === 'user_vendor').length;
  const flaggedBannedCount = peopleList.filter(
    (p) => p && ((p.flagsCount && p.flagsCount > 0) || p.status === 'warned' || p.status === 'banned' || p.status === 'suspended')
  ).length;

  let displayedPeople = peopleList;
  if (activeCategory === 'user') {
    displayedPeople = peopleList.filter((p) => p.personType === 'user');
  } else if (activeCategory === 'user_vendor') {
    displayedPeople = peopleList.filter((p) => p.personType === 'user_vendor');
  } else if (activeCategory === 'flagged') {
    displayedPeople = peopleList.filter(
      (p) => (p.flagsCount && p.flagsCount > 0) || p.status === 'warned' || p.status === 'banned' || p.status === 'suspended'
    );
  }

  const [strikeTargetPerson, setStrikeTargetPerson] = useState<PersonProfile | null>(null);
  const [strikeReason, setStrikeReason] = useState('Policy violation / moderation strike');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleOpenStrikePrompt = (id: string) => {
    const target = peopleList.find((p) => p.id === id);
    if (target) {
      setStrikeTargetPerson(target);
      setStrikeReason('Policy violation / moderation strike');
    }
  };

  const confirmIssueStrike = () => {
    if (!strikeTargetPerson) return;
    flagPersonMutation.mutate(
      { id: strikeTargetPerson.id, reason: strikeReason.trim() || 'Policy violation / moderation strike' },
      {
        onSuccess: (res) => {
          setStrikeTargetPerson(null);
          refetch();
          if (res.wasBanned) {
            addToast({
              type: 'error',
              title: 'Account Auto-Banned / Blocked (3/3 Strikes)',
              description: res.message || `${res.person.name} has reached 3 strikes and is AUTOMATICALLY BANNED / BLOCKED!`,
            });
          } else {
            addToast({
              type: 'warning',
              title: `Strike Issued (${res.person.flagsCount || res.person.strikes}/3 Strikes)`,
              description: res.message || `Strike #${res.person.flagsCount || res.person.strikes} issued to ${res.person.name}. (${3 - (res.person.flagsCount || res.person.strikes || 0)} strikes remaining before automatic ban).`,
            });
          }
        },
        onError: () => {
          setStrikeTargetPerson(null);
          addToast({
            type: 'error',
            title: 'Action Failed',
            description: 'Failed to issue strike to account. Please try again.',
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-col gap-2">
        <Breadcrumb />
        <PageHeader
          title="User Directory Management"
          description="Unified directory of resident customer accounts and user-vendor dual role accounts."
          action={
            <Button
              variant="outline"
              leftIcon={<RefreshCw size={14} />}
              onClick={() => refetch()}
              isLoading={isLoading}
            >
              Refresh Directory
            </Button>
          }
        />
      </div>

      {/* KPI Analytics Stat Cards (Clickable Category Selectors) */}
      <PeopleAnalyticsHeader
        onSelectCategory={setActiveCategory}
        activeCategory={activeCategory}
      />

      {/* Sub-Category Pill Tabs & Search Control Bar */}
      <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#541D26] text-white font-bold shadow-xs border border-[#C8A878]/30'
                : 'bg-[#FAF8F5] text-[#211A19] border border-[#E7DFD5] hover:bg-[#EEE5DA]'
            }`}
            onClick={() => setActiveCategory('all')}
          >
            All Directory Users ({totalCount})
          </button>
          <button
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'user'
                ? 'bg-[#541D26] text-white font-bold shadow-xs border border-[#C8A878]/30'
                : 'bg-[#FAF8F5] text-[#211A19] border border-[#E7DFD5] hover:bg-[#EEE5DA]'
            }`}
            onClick={() => setActiveCategory('user')}
          >
            Resident Customers ({residentCount})
          </button>
          <button
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'user_vendor'
                ? 'bg-[#541D26] text-white font-bold shadow-xs border border-[#C8A878]/30'
                : 'bg-[#FAF8F5] text-[#211A19] border border-[#E7DFD5] hover:bg-[#EEE5DA]'
            }`}
            onClick={() => setActiveCategory('user_vendor')}
          >
            User & Vendor ({dualRoleCount})
          </button>
          <button
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeCategory === 'flagged'
                ? 'bg-[#541D26] text-white font-bold shadow-xs border border-[#C8A878]/30'
                : 'bg-[#FAF8F5] text-[#211A19] border border-[#E7DFD5] hover:bg-[#EEE5DA]'
            }`}
            onClick={() => setActiveCategory('flagged')}
          >
            Flagged / Banned ({flaggedBannedCount})
            {flaggedBannedCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500" />}
          </button>
        </div>

        {/* Search & Filter Trigger */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="w-full md:w-72">
            <Input
              placeholder="Search directory..."
              leftIcon={<Search size={15} className="text-[#C8A878]" />}
              value={filters.search || ''}
              onChange={handleSearchChange}
            />
          </div>

          <Button
            variant="outline"
            leftIcon={<Filter size={14} />}
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filters
            {(filters.personType !== 'all' || filters.status !== 'all' || (filters.minFlags && filters.minFlags > 0)) && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#C8A878] text-white rounded-full text-[10px] font-bold">
                Active
              </span>
            )}
          </Button>

          <span className="text-xs text-[#78716C] font-semibold flex items-center gap-1 border-l border-[#E7DFD5] pl-3 ml-1 whitespace-nowrap">
            <Users size={14} className="text-[#C8A878]" /> <strong>{displayedPeople.length}</strong> Entries
          </span>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="bg-white border border-[#E7DFD5] rounded-2xl shadow-sm overflow-hidden p-1">
        <PeopleEnterpriseDataTable
          data={displayedPeople}
          isLoading={isLoading}
          onSelectPerson={(id) => setSelectedPersonId(id)}
          onIssueStrike={handleOpenStrikePrompt}
        />
      </div>

      {/* Filter Modal */}
      <PeopleFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        onResetFilters={() =>
          setFilters({ search: '', personType: 'all', status: 'all', societyName: 'all', minFlags: 0 })
        }
      />

      {/* Profile Details Drawer */}
      <PeopleDetailsDrawer
        isOpen={Boolean(selectedPersonId)}
        onClose={() => setSelectedPersonId(null)}
        personId={selectedPersonId}
        onSelectVendor={(vendor) => setSelectedVendorForDrawer(vendor)}
      />

      {/* Vendor Details Drawer */}
      <VendorDetailsDrawer
        isOpen={Boolean(selectedVendorForDrawer)}
        onClose={() => setSelectedVendorForDrawer(null)}
        vendor={selectedVendorForDrawer}
      />

      {/* Add User Profile Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Strike Warning Confirmation Modal */}
      <Modal
        isOpen={Boolean(strikeTargetPerson)}
        onClose={() => setStrikeTargetPerson(null)}
        title="🚩 Issue Account Strike Warning"
        subtitle={strikeTargetPerson ? `Target: ${strikeTargetPerson.name} (${strikeTargetPerson.id})` : ''}
        size="sm"
      >
        <div className="flex flex-col gap-4 p-4 text-xs font-sans">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-bold text-rose-900">
                Warning: You are about to issue a formal strike flag to {strikeTargetPerson?.name}.
              </span>
              <span>
                Current Strike Meter: <strong>{strikeTargetPerson?.flagsCount || 0} / 3 Strikes</strong>.
                If an account reaches 3 strikes, it will be automatically BANNED from platform access.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-[#211A19] uppercase tracking-wider">
              Strike Reason / Warning Message <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={2}
              value={strikeReason}
              onChange={(e) => setStrikeReason(e.target.value)}
              placeholder="Enter custom strike reason or warning message for backend payload..."
              className="w-full p-2.5 text-xs bg-white border border-[#E7DFD5] rounded-xl text-[#211A19] focus:outline-none focus:border-[#541D26] focus:ring-1 focus:ring-[#541D26] font-sans font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStrikeTargetPerson(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Flag size={14} className="text-white" />}
              className="bg-rose-700 hover:bg-rose-800 text-white border-rose-800"
              isLoading={flagPersonMutation.isPending}
              onClick={confirmIssueStrike}
            >
              Yes, Issue Strike 🚩
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
