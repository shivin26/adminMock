import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { Breadcrumb } from '../../components/layout/Breadcrumb/Breadcrumb';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { PeopleAnalyticsHeader } from '../../components/people/PeopleAnalyticsHeader';
import { PeopleEnterpriseDataTable } from '../../components/people/PeopleEnterpriseDataTable';
import { PeopleFilterModal } from '../../components/people/PeopleFilterModal';
import { PeopleDetailsDrawer } from '../../components/people/PeopleDetailsDrawer';
import { AddPersonModal } from '../../components/people/AddPersonModal';
import { usePeopleList, useFlagPerson } from '../../hooks/usePeople';
import { useToast } from '../../context/ToastContext';
import type { PeopleFilterOptions } from '../../types/people.types';
import { Search, Filter, UserPlus, RefreshCw, Users } from 'lucide-react';

export const PeoplePage: React.FC = () => {
  const { addToast } = useToast();
  const [filters, setFilters] = useState<PeopleFilterOptions>({
    search: '',
    personType: 'all',
    status: 'all',
    societyName: 'all',
    minFlags: 0,
  });

  const { data: peopleList = [], isLoading, refetch } = usePeopleList(filters);
  const flagPersonMutation = useFlagPerson();

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
          title="People & Directory Management"
          description="Unified directory of resident customers, vendor store owners, and platform sub-admin staff."
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
                Add Person Profile
              </Button>
            </div>
          }
        />
      </div>

      {/* KPI Analytics Stat Cards */}
      <PeopleAnalyticsHeader />

      {/* Control Bar: Search & Advanced Filters */}
      <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-96">
          <Input
            placeholder="Search by name, email, phone, store or society..."
            leftIcon={<Search size={15} className="text-[#C4A066]" />}
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            leftIcon={<Filter size={14} />}
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filter Directory
            {(filters.personType !== 'all' || filters.status !== 'all' || (filters.minFlags && filters.minFlags > 0)) && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#C4A066] text-white rounded-full text-[10px] font-bold">
                Active
              </span>
            )}
          </Button>

          <span className="text-xs text-[#6B7C70] font-semibold flex items-center gap-1 border-l border-[#E4DCC9] pl-3 ml-1">
            <Users size={14} className="text-[#C4A066]" /> Showing <strong>{peopleList.length}</strong> Profiles
          </span>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="bg-white border border-[#E4DCC9] rounded-2xl shadow-sm overflow-hidden p-1">
        <PeopleEnterpriseDataTable
          data={peopleList}
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
      />

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
