import React, { useState } from 'react';
import './SupportSettingsHubModal.css';
import { Drawer } from '../common/Drawer/Drawer';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { Input } from '../common/Input/Input';
import {
  FolderTree,
  ShieldAlert,
  RefreshCw,
  Mail,
  Clock,
  Save,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface SupportSettingsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportSettingsHubModal: React.FC<SupportSettingsHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addToast } = useToast();

  // Tab State: 'general' | 'sla' | 'assignment' | 'templates' | 'hours'
  const [activeTab, setActiveTab] = useState<'general' | 'sla' | 'assignment' | 'templates' | 'hours'>('general');

  // General Settings
  const [autoCloseResolvedDays, setAutoCloseResolvedDays] = useState(3);
  const [maxOpenTicketsPerAgent, setMaxOpenTicketsPerAgent] = useState(15);
  const [enableRoundRobin, setEnableRoundRobin] = useState(true);

  // Email Templates
  const [ticketCreatedTemplate, setTicketCreatedTemplate] = useState(
    'Hello {{reporter_name}},\n\nYour support ticket {{ticket_number}} has been received. Our team will review and respond within our SLA window.'
  );

  // Business Hours
  const [businessDays, setBusinessDays] = useState('Monday - Saturday');
  const [workingHours, setWorkingHours] = useState('09:00 AM - 08:00 PM IST');
  const [holidayNotice, setHolidayNotice] = useState('Independence Day (Aug 15), Diwali (Nov 01)');

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();

    addToast({
      type: 'success',
      title: 'Support Settings Saved',
      description: 'Platform SLA targets, auto-assignment rules, email templates, and business hours updated successfully.',
    });

    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Enterprise Support Configuration Hub"
      subtitle="Manage platform categories, SLA rules, email templates, agents, business hours, and notification policies."
      size="xl"
    >
      <form onSubmit={handleSaveAllSettings} className="flex flex-col gap-5 max-h-[74vh] overflow-y-auto pr-1">
        {/* Navigation Tabs */}
        <div className="settings-hub-nav">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FolderTree size={14} /> Categories &amp; Rules
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'sla' ? 'active' : ''}`}
            onClick={() => setActiveTab('sla')}
          >
            <ShieldAlert size={14} /> SLA &amp; Escalations
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'assignment' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignment')}
          >
            <RefreshCw size={14} /> Auto-Assignment
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <Mail size={14} /> Email Templates
          </button>

          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'hours' ? 'active' : ''}`}
            onClick={() => setActiveTab('hours')}
          >
            <Clock size={14} /> Business Hours &amp; Holidays
          </button>
        </div>

        {/* Tab 1: Categories & Rules */}
        {activeTab === 'general' && (
          <div className="settings-section-card">
            <h4 className="text-xs font-bold text-[#211A19] uppercase tracking-wider">
              Categories &amp; Lifecycle Controls
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#211A19]">Auto-Close Resolved Tickets (Days):</label>
                <input
                  type="number"
                  value={autoCloseResolvedDays}
                  onChange={(e) => setAutoCloseResolvedDays(Number(e.target.value))}
                  className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl outline-none font-bold text-[#211A19]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#211A19]">Max Active Load Per Agent:</label>
                <input
                  type="number"
                  value={maxOpenTicketsPerAgent}
                  onChange={(e) => setMaxOpenTicketsPerAgent(Number(e.target.value))}
                  className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl outline-none font-bold text-[#211A19]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#E7DFD5]/60 pt-3 text-xs">
              <span className="font-bold text-[#211A19]">Active Platform Categories:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="primary">TECHNICAL INQUIRIES</Badge>
                <Badge variant="warning">BILLING &amp; SETTLEMENTS</Badge>
                <Badge variant="neutral">VENDOR ONBOARDING</Badge>
                <Badge variant="success">GENERAL SUPPORT</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SLA & Escalations */}
        {activeTab === 'sla' && (
          <div className="settings-section-card">
            <h4 className="text-xs font-bold text-[#211A19] uppercase tracking-wider">
              SLA Policy Thresholds
            </h4>

            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between font-bold text-[#211A19]">
                <span>P1 Critical Target: 15m 1st Response / 1h Resolution</span>
                <Badge variant="danger">CRITICAL</Badge>
              </div>
              <div className="flex items-center justify-between font-bold text-[#211A19]">
                <span>P2 High Target: 30m 1st Response / 4h Resolution</span>
                <Badge variant="warning">HIGH</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Auto-Assignment */}
        {activeTab === 'assignment' && (
          <div className="settings-section-card">
            <h4 className="text-xs font-bold text-[#211A19] uppercase tracking-wider">
              Auto-Assignment &amp; Round-Robin Routing
            </h4>

            <label className="flex items-center gap-2 text-xs font-bold text-[#211A19] cursor-pointer">
              <input
                type="checkbox"
                checked={enableRoundRobin}
                onChange={(e) => setEnableRoundRobin(e.target.checked)}
                className="rounded border-[#E7DFD5]"
              />
              Enable Automatic Round-Robin Intake Assignment
            </label>

            <p className="text-xs text-[#78716C] bg-[#FAF8F5] p-3 rounded-xl border border-[#E7DFD5]">
              When enabled, incoming vendor and society support tickets are automatically assigned to the active staff agent with the lowest open workload.
            </p>
          </div>
        )}

        {/* Tab 4: Email Templates */}
        {activeTab === 'templates' && (
          <div className="settings-section-card">
            <h4 className="text-xs font-bold text-[#211A19] uppercase tracking-wider">
              Customer Notification Email Templates
            </h4>

            <div className="flex flex-col gap-1.5 text-xs">
              <label className="font-semibold text-[#211A19]">Ticket Confirmation Email Body:</label>
              <textarea
                rows={4}
                value={ticketCreatedTemplate}
                onChange={(e) => setTicketCreatedTemplate(e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl font-mono text-xs text-[#211A19] outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 5: Business Hours & Holidays */}
        {activeTab === 'hours' && (
          <div className="settings-section-card">
            <h4 className="text-xs font-bold text-[#211A19] uppercase tracking-wider">
              Operational Business Hours &amp; Holiday Calendar
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <Input
                label="Working Days"
                value={businessDays}
                onChange={(e) => setBusinessDays(e.target.value)}
              />

              <Input
                label="Daily Operational Hours"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-[#211A19]">Statutory Holidays Schedule:</label>
              <input
                type="text"
                value={holidayNotice}
                onChange={(e) => setHolidayNotice(e.target.value)}
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl font-medium text-[#211A19] outline-none"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" leftIcon={<Save size={14} />}>
            Save All Support Settings
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
