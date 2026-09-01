import React, { useState } from 'react';
import './SupportAssignmentModal.css';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import {
  UserCheck,
  RefreshCw,
  History,
  Eye,
  BellRing,
  Send,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface SupportAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId?: string | null;
  ticketNumber?: string;
  currentAssignee?: string;
}

export const SupportAssignmentModal: React.FC<SupportAssignmentModalProps> = ({
  isOpen,
  onClose,
  ticketId: _ticketId,
  ticketNumber = 'TICK-9081',
  currentAssignee = 'Super Admin',
}) => {
  const { addToast } = useToast();

  // Mode: 'agent' | 'team' | 'department' | 'round_robin'
  const [assignMode, setAssignMode] = useState<'agent' | 'team' | 'department' | 'round_robin'>('agent');
  
  const [selectedAgent, setSelectedAgent] = useState('Vikram Mehta');
  const [selectedTeam, setSelectedTeam] = useState('Tier 2 Escalations Team');
  const [selectedDepartment, setSelectedDepartment] = useState('Payment & Financial Operations');
  const [handoverNote, setHandoverNote] = useState('');
  const [followers, setFollowers] = useState<string[]>(['Super Admin', 'Ananya Sharma']);
  const [newFollowerInput, setNewFollowerInput] = useState('');

  const [history] = useState([
    {
      id: 'h-1',
      assignee: 'Vikram Mehta',
      assignedBy: 'Super Admin',
      reason: 'Flagged for Razorpay settlement verification',
      timestamp: '2 hours ago',
    },
    {
      id: 'h-2',
      assignee: 'Super Admin',
      assignedBy: 'System Auto-Assign',
      reason: 'Initial ticket intake routing',
      timestamp: '3 hours ago',
    },
  ]);

  const handleAddFollower = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newFollowerInput.trim()) {
      e.preventDefault();
      setFollowers([...followers, newFollowerInput.trim()]);
      setNewFollowerInput('');
    }
  };

  const handleRemoveFollower = (follower: string) => {
    setFollowers(followers.filter((f) => f !== follower));
  };

  const handleExecuteAssignment = (e: React.FormEvent) => {
    e.preventDefault();

    let targetName = selectedAgent;
    if (assignMode === 'team') targetName = selectedTeam;
    if (assignMode === 'department') targetName = selectedDepartment;
    if (assignMode === 'round_robin') targetName = 'Auto-Assigned Agent (Round Robin)';

    addToast({
      type: 'success',
      title: 'Ticket Reassigned',
      description: `Ticket #${ticketNumber} assigned to ${targetName}. Notifications dispatched to followers.`,
    });

    onClose();
  };

  const handleRoundRobinTrigger = () => {
    setAssignMode('round_robin');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reassign Ticket ${ticketNumber}`}
      subtitle={`Currently assigned to: ${currentAssignee}`}
    >
      <form onSubmit={handleExecuteAssignment} className="flex flex-col gap-5 max-h-[74vh] overflow-y-auto pr-1">
        {/* Assignment Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl">
          <button
            type="button"
            className={`assignment-mode-btn ${assignMode === 'agent' ? 'active' : ''}`}
            onClick={() => setAssignMode('agent')}
          >
            Individual Agent
          </button>
          <button
            type="button"
            className={`assignment-mode-btn ${assignMode === 'team' ? 'active' : ''}`}
            onClick={() => setAssignMode('team')}
          >
            Team Assignment
          </button>
          <button
            type="button"
            className={`assignment-mode-btn ${assignMode === 'department' ? 'active' : ''}`}
            onClick={() => setAssignMode('department')}
          >
            Department
          </button>
          <button
            type="button"
            className={`assignment-mode-btn ${assignMode === 'round_robin' ? 'active' : ''}`}
            onClick={handleRoundRobinTrigger}
          >
            Auto Round-Robin
          </button>
        </div>

        {/* Dynamic Assignment Inputs */}
        {assignMode === 'agent' && (
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-[#211A19]">Select Destination Agent:</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-semibold text-[#211A19] outline-none"
            >
              <option value="Super Admin">Super Admin (Lead)</option>
              <option value="Vikram Mehta">Vikram Mehta (Tier 2 Lead)</option>
              <option value="Ananya Sharma">Ananya Sharma (KYC Specialist)</option>
              <option value="Rahul Verma">Rahul Verma (Gate Controller)</option>
            </select>
          </div>
        )}

        {assignMode === 'team' && (
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-[#211A19]">Select Target Support Team Queue:</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-semibold text-[#211A19] outline-none"
            >
              <option value="Tier 2 Escalations Team">Tier 2 Escalations Team</option>
              <option value="Vendor Verification Team">Vendor Verification Team</option>
              <option value="Society Access Desk">Society Access Desk</option>
              <option value="Billing & Tax Operations">Billing & Tax Operations</option>
            </select>
          </div>
        )}

        {assignMode === 'department' && (
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-[#211A19]">Select Department Queue:</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-semibold text-[#211A19] outline-none"
            >
              <option value="Payment & Financial Operations">Payment & Financial Operations</option>
              <option value="Engineering & Infrastructure">Engineering & Infrastructure</option>
              <option value="Onboarding & KYC Compliance">Onboarding & KYC Compliance</option>
            </select>
          </div>
        )}

        {assignMode === 'round_robin' && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Round-Robin Routing Active:</strong> Automatically assigns this inquiry to the active agent with the lowest open ticket volume.
            </span>
          </div>
        )}

        {/* Handover Note & @Mentions */}
        <div className="flex flex-col gap-1.5 text-xs">
          <label className="font-bold text-[#211A19] flex items-center justify-between">
            <span>Handover Note &amp; Staff Mentions:</span>
            <span className="text-[11px] text-[#C8A878] font-semibold">Use @name to notify staff</span>
          </label>
          <textarea
            rows={3}
            placeholder="e.g. @vikram please verify Razorpay batch TXN9871 settlement details with finance..."
            value={handoverNote}
            onChange={(e) => setHandoverNote(e.target.value)}
            className="w-full p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-[#211A19] outline-none focus:border-[#C8A878] resize-none"
          />
        </div>

        {/* Watchers & Followers Box */}
        <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl flex flex-col gap-2">
          <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
            <Eye size={14} className="text-[#C8A878]" /> Ticket Watchers &amp; Followers ({followers.length})
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {followers.map((f) => (
              <span
                key={f}
                className="text-xs font-semibold text-[#211A19] bg-[#FAF8F5] border border-[#E7DFD5] px-2.5 py-1 rounded-lg flex items-center gap-1.5"
              >
                <BellRing size={11} className="text-[#C8A878]" /> {f}
                <button
                  type="button"
                  onClick={() => handleRemoveFollower(f)}
                  className="text-[#78716C] hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <input
            type="text"
            placeholder="Add follower name & press Enter..."
            value={newFollowerInput}
            onChange={(e) => setNewFollowerInput(e.target.value)}
            onKeyDown={handleAddFollower}
            className="w-full p-2 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-[#211A19] outline-none"
          />
        </div>

        {/* Reassignment Audit History Timeline */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1.5">
            <History size={14} className="text-[#C8A878]" /> Reassignment Audit History
          </span>

          <div className="assignment-timeline-list">
            {history.map((item) => (
              <div key={item.id} className="assignment-timeline-item">
                <UserCheck size={14} className="text-[#C8A878] mt-0.5" />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#211A19]">{item.assignee}</span>
                    <span className="text-[10px] text-[#78716C]">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    Assigned by <strong>{item.assignedBy}</strong> • {item.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7DFD5]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" leftIcon={<Send size={14} />}>
            Confirm Reassignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
