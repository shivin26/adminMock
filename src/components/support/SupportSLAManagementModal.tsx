import React, { useState } from 'react';
import './SupportSLAManagementModal.css';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import {
  Clock,
  ShieldAlert,
  History,
  Save,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface SLAPolicy {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  name: string;
  responseTargetMinutes: number;
  resolutionTargetHours: number;
  level1WarningPct: number;
  level2EscalatePct: number;
  autoReassignOnBreach: boolean;
}

const INITIAL_SLA_POLICIES: SLAPolicy[] = [
  {
    id: 'sla-1',
    priority: 'critical',
    name: 'P1 - Critical Outage & Gate Access',
    responseTargetMinutes: 15,
    resolutionTargetHours: 1,
    level1WarningPct: 50,
    level2EscalatePct: 75,
    autoReassignOnBreach: true,
  },
  {
    id: 'sla-2',
    priority: 'high',
    name: 'P2 - High Priority Payment & Payouts',
    responseTargetMinutes: 30,
    resolutionTargetHours: 4,
    level1WarningPct: 50,
    level2EscalatePct: 80,
    autoReassignOnBreach: true,
  },
  {
    id: 'sla-3',
    priority: 'medium',
    name: 'P3 - General Vendor Inquiries',
    responseTargetMinutes: 120,
    resolutionTargetHours: 12,
    level1WarningPct: 60,
    level2EscalatePct: 85,
    autoReassignOnBreach: false,
  },
  {
    id: 'sla-4',
    priority: 'low',
    name: 'P4 - Feature Requests & Documentation',
    responseTargetMinutes: 240,
    resolutionTargetHours: 24,
    level1WarningPct: 70,
    level2EscalatePct: 90,
    autoReassignOnBreach: false,
  },
];

export interface SupportSLAManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportSLAManagementModal: React.FC<SupportSLAManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addToast } = useToast();
  const [policies, setPolicies] = useState<SLAPolicy[]>(INITIAL_SLA_POLICIES);

  const handleUpdatePolicy = (id: string, field: keyof SLAPolicy, value: any) => {
    setPolicies(
      policies.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSavePolicies = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'SLA Policies Saved',
      description: 'Updated SLA targets, escalation thresholds, and breach triggers active.',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enterprise SLA Management & Escalation Engine"
      subtitle="Configure response/resolution targets, multi-level escalation thresholds, and SLA reporting."
    >
      <form onSubmit={handleSavePolicies} className="flex flex-col gap-5 max-h-[74vh] overflow-y-auto pr-1">
        {/* SLA Breach Warning Banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold block">Live Breach Warning Active</span>
              <span className="text-[11px] text-amber-700">1 ticket (<strong className="font-mono">TICK-9082</strong>) is currently at 85% SLA expiration (&lt; 15m left)</span>
            </div>
          </div>
          <Badge variant="warning">1 AT RISK</Badge>
        </div>

        {/* SLA Compliance KPI Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="sla-stat-box">
            <span className="text-[11px] font-semibold text-[#78716C] block">SLA Compliance Rate</span>
            <span className="text-lg font-bold text-[#10B981] font-mono">96.8%</span>
          </div>

          <div className="sla-stat-box">
            <span className="text-[11px] font-semibold text-[#78716C] block">Avg Response Time</span>
            <span className="text-lg font-bold text-[#211A19] font-mono">14 mins</span>
          </div>

          <div className="sla-stat-box">
            <span className="text-[11px] font-semibold text-[#78716C] block">Avg Resolution Time</span>
            <span className="text-lg font-bold text-[#211A19] font-mono">2.4 hrs</span>
          </div>

          <div className="sla-stat-box">
            <span className="text-[11px] font-semibold text-[#78716C] block">Total SLA Breaches</span>
            <span className="text-lg font-bold text-rose-600 font-mono">4</span>
          </div>
        </div>

        {/* Priority SLA Target Configuration Grid */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={13} className="text-[#C8A878]" /> SLA Targets by Priority
          </span>

          <div className="sla-policy-grid">
            {policies.map((p) => (
              <div key={p.id} className="sla-card-item">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#211A19] text-xs font-serif">{p.name}</span>
                  <Badge variant={p.priority === 'critical' ? 'danger' : p.priority === 'high' ? 'warning' : 'neutral'}>
                    {p.priority.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#78716C] font-medium">1st Response (Mins):</label>
                    <input
                      type="number"
                      value={p.responseTargetMinutes}
                      onChange={(e) => handleUpdatePolicy(p.id, 'responseTargetMinutes', Number(e.target.value))}
                      className="p-2 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-mono font-bold text-[#211A19] outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[#78716C] font-medium">Resolution (Hours):</label>
                    <input
                      type="number"
                      value={p.resolutionTargetHours}
                      onChange={(e) => handleUpdatePolicy(p.id, 'resolutionTargetHours', Number(e.target.value))}
                      className="p-2 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-mono font-bold text-[#211A19] outline-none"
                    />
                  </div>
                </div>

                {/* Multi-Level Escalation Thresholds */}
                <div className="flex flex-col gap-1.5 border-t border-[#E7DFD5]/60 pt-2 text-[11px]">
                  <span className="font-bold text-[#211A19]">Escalation Triggers:</span>
                  <div className="flex items-center justify-between text-[#78716C]">
                    <span>Level 1 Staff Alert: <strong>{p.level1WarningPct}% SLA</strong></span>
                    <span>Level 2 Lead Alert: <strong>{p.level2EscalatePct}% SLA</strong></span>
                  </div>

                  <label className="flex items-center gap-1.5 font-semibold text-[#211A19] cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={p.autoReassignOnBreach}
                      onChange={(e) => handleUpdatePolicy(p.id, 'autoReassignOnBreach', e.target.checked)}
                      className="rounded border-[#E7DFD5]"
                    />
                    Auto-reassign to Super Admin on SLA breach
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Escalation History Log */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1.5">
            <History size={13} className="text-[#C8A878]" /> SLA Escalation Audit Trail
          </span>

          <div className="p-3 bg-white border border-[#E7DFD5] rounded-xl flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between border-b border-[#E7DFD5]/60 pb-2">
              <div>
                <span className="font-mono font-bold text-[#C8A878]">TICK-9082</span>
                <span className="text-[#211A19] font-semibold ml-2">Level 2 Escalation Warning Triggered</span>
              </div>
              <span className="text-[11px] text-[#78716C]">15 mins ago</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-[#C8A878]">TICK-9081</span>
                <span className="text-[#211A19] font-semibold ml-2">First Response Target Met (8m)</span>
              </div>
              <span className="text-[11px] text-[#78716C]">2 hours ago</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7DFD5]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" leftIcon={<Save size={14} />}>
            Save SLA Configuration
          </Button>
        </div>
      </form>
    </Modal>
  );
};
