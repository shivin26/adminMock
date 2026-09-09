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
import { Modal } from '../../components/common/Modal/Modal';
import type { PeopleFilterOptions, PersonProfile } from '../../types/people.types';
import { Search, Filter, UserPlus, RefreshCw, Users, AlertTriangle, Flag } from 'lucide-react';

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
  const [strikeTargetPerson, setStrikeTargetPerson] = useState<PersonProfile | null>(null);
  const [strikeReason, setStrikeReason] = useState('Policy violation / moderation strike');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
              title: 'Account Auto-Banned (3/3 Strikes)',
              description: `${res.person.name} has been automatically banned from platform access.`,
            });
          } else {
            addToast({
              type: 'warning',
              title: `Strike Issued (${res.person.flagsCount || res.person.strikes}/3 Strikes)`,
              description: `Warning strike issued to ${res.person.name}.`,
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
      <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-96">
          <Input
            placeholder="Search by name, email, phone, store or society..."
            leftIcon={<Search size={15} className="text-[#C8A878]" />}
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
              <span className="ml-1 px-1.5 py-0.5 bg-[#C8A878] text-white rounded-full text-[10px] font-bold">
                Active
              </span>
            )}
          </Button>

          <span className="text-xs text-[#78716C] font-semibold flex items-center gap-1 border-l border-[#E7DFD5] pl-3 ml-1">
            <Users size={14} className="text-[#C8A878]" /> Showing <strong>{peopleList.length}</strong> Profiles
          </span>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="bg-white border border-[#E7DFD5] rounded-2xl shadow-sm overflow-hidden p-1">
        <PeopleEnterpriseDataTable
          data={peopleList}
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
      />

      {/* Add Person Modal */}
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
