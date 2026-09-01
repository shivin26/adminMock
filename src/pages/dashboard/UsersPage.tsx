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
import type { PeopleFilterOptions } from '../../types/people.types';
import type { Vendor } from '../../types/vendor.types';
import { Search, Filter, UserPlus, RefreshCw, Users } from 'lucide-react';

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleIssueStrike = (id: string) => {
    flagPersonMutation.mutate(id, {
      onSuccess: (res) => {
        refetch();
        if (res.wasBanned) {
          addToast({
            type: 'error',
            title: 'Account Auto-Banned (3/3 Strikes)',
            description: `${res.person.name} has been automatically banned from platform access.`,
          });
        } else {
          addToast({
            type: 'warning',
            title: `Strike Issued (${res.person.flagsCount}/3 Strikes)`,
            description: `Warning strike issued to ${res.person.name}.`,
          });
        }
      },
    });
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                leftIcon={<RefreshCw size={14} />}
                onClick={() => refetch()}
                isLoading={isLoading}
              >
                Refresh Directory
              </Button>
              <Button
                leftIcon={<UserPlus size={14} />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add User Profile
              </Button>
            </div>
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
          onIssueStrike={handleIssueStrike}
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
    </div>
  );
};
