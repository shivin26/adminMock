import React, { useState, useMemo } from 'react';
import './SupportPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { StatCard } from '../../components/common/StatCard/StatCard';
import { Button } from '../../components/common/Button/Button';
import { useTickets, useUpdateTicketStatus } from '../../hooks/useSupport';
import type { TicketStatus } from '../../types/support.types';
import { SupportTicketFilterBar } from '../../components/support/SupportTicketFilterBar';
import { SupportTicketDetailsDrawer } from '../../components/support/SupportTicketDetailsDrawer';
import { CreateSupportTicketModal } from '../../components/support/CreateSupportTicketModal';
import { SupportAnalyticsDashboard } from '../../components/support/SupportAnalyticsDashboard';
import { SupportEnterpriseDataTable } from '../../components/support/SupportEnterpriseDataTable';
import {
  Headphones,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart2,
  ListFilter,
} from 'lucide-react';

import { SupportEnterpriseFilterModal, INITIAL_FILTER_STATE } from '../../components/support/SupportEnterpriseFilterModal';
import type { FilterState } from '../../components/support/SupportEnterpriseFilterModal';
import { SupportTagManagementModal } from '../../components/support/SupportTagManagementModal';
import { SupportSLAManagementModal } from '../../components/support/SupportSLAManagementModal';
import { SupportSettingsHubModal } from '../../components/support/SupportSettingsHubModal';
import { Tag, ShieldAlert, Settings, Flame } from 'lucide-react';

import { UserProfileDetailsModal } from '../../components/support/UserProfileDetailsModal';
import { VendorProfileDetailsModal } from '../../components/support/VendorProfileDetailsModal';

export const SupportPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'analytics' | 'queue'>('analytics');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedUserIdentifier, setSelectedUserIdentifier] = useState<string | null>(null);
  const [selectedVendorIdentifier, setSelectedVendorIdentifier] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isSLAModalOpen, setIsSLAModalOpen] = useState(false);
  const [isSettingsHubModalOpen, setIsSettingsHubModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  const [priorityFocus, setPriorityFocus] = useState<string>('all');

  const { data: rawTickets, isLoading } = useTickets({
    category: categoryFilter,
    search: searchTerm,
  });

  const tickets = useMemo(() => (Array.isArray(rawTickets) ? rawTickets : []), [rawTickets]);

  const updateStatusMutation = useUpdateTicketStatus();

  const counts = useMemo(() => {
    return {
      all: tickets.length,
      open: tickets.filter((t) => t && t.status === 'open').length,
      in_progress: tickets.filter((t) => t && t.status === 'in_progress').length,
      resolved: tickets.filter((t) => t && t.status === 'resolved').length,
      urgent: tickets.filter((t) => t && t.priority === 'urgent').length,
      high: tickets.filter((t) => t && t.priority === 'high').length,
      medium: tickets.filter((t) => t && t.priority === 'medium').length,
      low: tickets.filter((t) => t && t.priority === 'low').length,
    };
  }, [tickets]);

  const allTickets = useMemo(() => {
    let list = tickets;
    if (activeTab !== 'all') {
      list = list.filter((t) => t && t.status === activeTab);
    }
    if (priorityFocus !== 'all') {
      list = list.filter((t) => t.priority === priorityFocus);
    }
    return list;
  }, [rawTickets, activeTab, priorityFocus]);

  const handleBulkStatus = (ids: string[], status: TicketStatus) => {
    ids.forEach((id) => {
      updateStatusMutation.mutate({ ticketId: id, status });
    });
  };

  return (
    <div className="support-page">
      <PageHeader
        title="Support Desk & Service Analytics"
        description="Enterprise Zendesk & Jira Service Desk style analytics, SLA performance, and landing website inquiry intake."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<Settings size={15} />}
              onClick={() => setIsSettingsHubModalOpen(true)}
            >
              Settings
            </Button>
            <Button
              variant="outline"
              leftIcon={<ShieldAlert size={15} />}
              onClick={() => setIsSLAModalOpen(true)}
            >
              SLA Targets
            </Button>
            <Button
              variant="outline"
              leftIcon={<Tag size={15} />}
              onClick={() => setIsTagModalOpen(true)}
            >
              Tags
            </Button>
            <Button
              leftIcon={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Log Ticket
            </Button>
          </div>
        }
      />

      {/* View Switcher Tabs & Live Web Intake Stream */}
      <div className="flex items-center justify-between p-2 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'analytics'
                ? 'bg-[#18281F] text-white shadow-sm'
                : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
            }`}
            onClick={() => setViewMode('analytics')}
          >
            <BarChart2 size={16} />
            <span>Ticket Dashboard &amp; Analytics</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'queue'
                ? 'bg-[#18281F] text-white shadow-sm'
                : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
            }`}
            onClick={() => setViewMode('queue')}
          >
            <ListFilter size={16} />
            <span>Ticket Operations Queue ({counts.all})</span>
          </button>
        </div>

        {/* Interactive Priority Focus View Selector */}
        <div className="px-3.5 py-1.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm">
          <span className="text-[#6B7C70] flex items-center gap-1.5 whitespace-nowrap">
            <Flame size={14} className="text-rose-500" /> Priority Focus View:
          </span>
          <select
            value={priorityFocus}
            onChange={(e) => setPriorityFocus(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#18281F] outline-none cursor-pointer"
          >
            <option value="all">All Priorities ({counts.all})</option>
            <option value="urgent">🔥 Urgent SLA ({counts.urgent})</option>
            <option value="high">⚡ High Priority ({counts.high})</option>
            <option value="medium">🟢 Medium Priority ({counts.medium})</option>
            <option value="low">⚪ Low Priority ({counts.low})</option>
          </select>
        </div>
      </div>

      {viewMode === 'analytics' ? (
        <SupportAnalyticsDashboard
          tickets={allTickets}
          isLoading={isLoading}
          onSelectTicket={(id) => setSelectedTicketId(id)}
          onNavigateToQueue={(status) => {
            if (status) setActiveTab(status);
            setViewMode('queue');
          }}
          onOpenSLA={() => setIsSLAModalOpen(true)}
          onOpenSettings={() => setIsSettingsHubModalOpen(true)}
        />
      ) : (
        <div className="support-queue-container">
          {/* KPI Stats Summary */}
          <div className="support-stats-grid">
            <StatCard
              title="Total Support Inquiries"
              value={counts.all}
              change="Real-time ticket volume"
              isPositive={true}
              icon={<Headphones size={22} />}
              onClick={() => setActiveTab('all')}
            />
            <StatCard
              title="Open Tickets"
              value={counts.open}
              change="Awaiting staff action"
              isPositive={false}
              icon={<AlertTriangle size={22} />}
              onClick={() => setActiveTab('open')}
            />
            <StatCard
              title="In Progress"
              value={counts.in_progress}
              change="Under investigation"
              isPositive={true}
              icon={<Clock size={22} />}
              onClick={() => setActiveTab('in_progress')}
            />
            <StatCard
              title="Resolved Tickets"
              value={counts.resolved}
              change="SLA compliant"
              isPositive={true}
              icon={<CheckCircle2 size={22} />}
              onClick={() => setActiveTab('resolved')}
            />
          </div>

          {/* Filter Bar */}
          <SupportTicketFilterBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            counts={counts}
            onOpenAdvancedFilters={() => setIsFilterModalOpen(true)}
          />

          {/* Enterprise Data Table with 15 Columns, Bulk Actions, Column Visibility, Exports */}
          <SupportEnterpriseDataTable
            tickets={allTickets}
            isLoading={isLoading}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            onUpdateBulkStatus={handleBulkStatus}
            onOpenUserProfile={(userName) => setSelectedUserIdentifier(userName)}
            onOpenVendorProfile={(vendorName) => setSelectedVendorIdentifier(vendorName)}
          />
        </div>
      )}

      {/* Ticket Details Side Drawer */}
      <SupportTicketDetailsDrawer
        isOpen={Boolean(selectedTicketId)}
        onClose={() => setSelectedTicketId(null)}
        ticketId={selectedTicketId}
        onSelectTicket={(id) => setSelectedTicketId(id)}
        onOpenUserProfile={(userName) => setSelectedUserIdentifier(userName)}
        onOpenVendorProfile={(vendorName) => setSelectedVendorIdentifier(vendorName)}
      />

      {/* User Profile Details Modal with 3-Flags Strike Meter */}
      <UserProfileDetailsModal
        isOpen={Boolean(selectedUserIdentifier)}
        onClose={() => setSelectedUserIdentifier(null)}
        userIdentifier={selectedUserIdentifier}
        onSelectTicket={(id) => setSelectedTicketId(id)}
      />

      {/* Vendor Store Profile Modal with Auto-Block Rating Meter */}
      <VendorProfileDetailsModal
        isOpen={Boolean(selectedVendorIdentifier)}
        onClose={() => setSelectedVendorIdentifier(null)}
        vendorIdentifier={selectedVendorIdentifier}
        onSelectTicket={(id) => setSelectedTicketId(id)}
      />

      {/* Create Ticket Modal */}
      <CreateSupportTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Enterprise Filter Modal */}
      <SupportEnterpriseFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={advancedFilters}
        onApplyFilters={(newFilters) => setAdvancedFilters(newFilters)}
      />

      {/* Tag Management Modal */}
      <SupportTagManagementModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
      />

      {/* SLA Management Modal */}
      <SupportSLAManagementModal
        isOpen={isSLAModalOpen}
        onClose={() => setIsSLAModalOpen(false)}
      />

      {/* Support Settings Hub Modal */}
      <SupportSettingsHubModal
        isOpen={isSettingsHubModalOpen}
        onClose={() => setIsSettingsHubModalOpen(false)}
      />
    </div>
  );
};
