import React, { useState } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SupportTicketStatusBadge } from './SupportTicketStatusBadge';
import { useTicketDetails, useTicketMessages, useSendTicketReply, useUpdateTicketStatus, useTickets } from '../../hooks/useSupport';
import type { TicketPriority } from '../../types/support.types';
import {
  User,
  Send,
  Lock,
  MessageSquare,
  Clock,
  Mail,
  Phone,
  Store,
  Tag,
  Paperclip,
  History,
  UserPlus,
  Flame,
  GitMerge,
  CheckCircle2,
  FileText,
  Download,
  Trash2,
  Globe,
  Save,
  Unlink,
  ShoppingBag,
  TrendingDown,
} from 'lucide-react';
import { SupportAssignmentModal } from './SupportAssignmentModal';
import { SupportMergeTicketModal } from './SupportMergeTicketModal';
import { SupportAddFollowersModal } from './SupportAddFollowersModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { formatDate } from '../../utils/formatters.utils';

import { useToast } from '../../context/ToastContext';

export interface SupportTicketDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId?: string | null;
  onSelectTicket?: (ticketId: string) => void;
  onOpenUserProfile?: (userName: string) => void;
  onOpenVendorProfile?: (vendorName: string) => void;
}

const INITIAL_MERGED_MAP: Record<string, Array<{ ticketNumber: string; subject: string; mergedBy: string; mergedAt: string }>> = {
  't-101': [
    {
      ticketNumber: 'TICK-8042',
      subject: 'Razorpay UPI Settlement Batch #9081 Verification',
      mergedBy: 'Vikram Mehta',
      mergedAt: 'Aug 7, 02:15 PM',
    },
  ],
  't-102': [
    {
      ticketNumber: 'TICK-7911',
      subject: 'Resident Delivery GPS Refresh Sync Issue',
      mergedBy: 'Super Admin',
      mergedAt: 'Aug 7, 01:30 PM',
    },
    {
      ticketNumber: 'TICK-7890',
      subject: 'Delivery Pass Location Latency',
      mergedBy: 'Ananya Sharma',
      mergedAt: 'Aug 7, 11:45 AM',
    },
  ],
  't-103': [],
  't-104': [],
  't-105': [
    {
      ticketNumber: 'TICK-8010',
      subject: 'Store Category Update Intake',
      mergedBy: 'Super Admin',
      mergedAt: 'Aug 7, 10:00 AM',
    },
  ],
};

export const SupportTicketDetailsDrawer: React.FC<SupportTicketDetailsDrawerProps> = ({
  isOpen,
  onClose,
  ticketId,
  onSelectTicket,
  onOpenUserProfile,
  onOpenVendorProfile,
}) => {
  const { addToast } = useToast();
  const { data: ticket, isLoading: isLoadingTicket } = useTicketDetails(ticketId || undefined);
  const { data: messages = [], isLoading: isLoadingMessages } = useTicketMessages(ticketId || undefined);
  const { data: allTickets = [] } = useTickets();
  
  const sendReplyMutation = useSendTicketReply();
  const updateStatusMutation = useUpdateTicketStatus();

  // Dynamically filter all past tickets by this ticket's creator
  const creatorPastTickets = React.useMemo(() => {
    if (!ticket) return [];
    return allTickets.filter(
      (t) =>
        t.id !== ticket.id &&
        t.ticketNumber !== ticket.ticketNumber &&
        (
          (t.reporterName && t.reporterName.toLowerCase() === ticket.reporterName.toLowerCase()) ||
          (t.reporterEmail && t.reporterEmail.toLowerCase() === ticket.reporterEmail.toLowerCase()) ||
          (t.entityName && ticket.entityName && t.entityName.toLowerCase() === ticket.entityName.toLowerCase())
        )
    );
  }, [allTickets, ticket]);

  // Tab State: 'conversation' | 'notes' | 'attachments' | 'audit'
  const [activeTab, setActiveTab] = useState<'conversation' | 'notes' | 'attachments' | 'audit'>('conversation');

  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState('Vikram Mehta');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('high');
  const [newTagInput, setNewTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Billing', 'Razorpay', 'SLA-Priority']);
  const [followers, setFollowers] = useState<string[]>(['Super Admin']);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isAddFollowerModalOpen, setIsAddFollowerModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isEscalateConfirmOpen, setIsEscalateConfirmOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [mergedTicketsMap, setMergedTicketsMap] = useState<
    Record<string, Array<{ ticketNumber: string; subject: string; mergedBy: string; mergedAt: string }>>
  >(INITIAL_MERGED_MAP);

  const activeMergedList = (ticketId && mergedTicketsMap[ticketId]) || [];

  // Live SLA Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180 * 60);

  React.useEffect(() => {
    if (ticket) {
      if (ticket.assignedTo) setAssignedAgent(ticket.assignedTo);
      if (ticket.priority) setTicketPriority(ticket.priority);
      const initialSecs = (ticket.slaMinutesRemaining || 180) * 60;
      setSecondsRemaining(initialSecs);
      setHasUnsavedChanges(false);
    }
  }, [ticket]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSLATime = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00h 00m 00s (BREACHED)';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  if (!ticketId) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    sendReplyMutation.mutate(
      {
        ticketId,
        payload: {
          message: replyMessage,
          isInternalNote: isInternalNote || activeTab === 'notes',
        },
      },
      {
        onSuccess: () => {
          setReplyMessage('');
          addToast({
            type: 'success',
            title: isInternalNote || activeTab === 'notes' ? 'Internal Note Saved' : 'Reply Sent',
            description: isInternalNote || activeTab === 'notes' 
              ? `Ticket #${ticket?.ticketNumber}: Staff note appended to thread.` 
              : `Ticket #${ticket?.ticketNumber}: Official response dispatched to ${ticket?.reporterName}.`,
          });
        },
      }
    );
  };

  const handleAgentChange = (newAgent: string) => {
    setAssignedAgent(newAgent);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    updateStatusMutation.mutate({
      ticketId,
      priority: ticketPriority,
      assignedTo: assignedAgent,
    });
    setHasUnsavedChanges(false);
    addToast({
      type: 'success',
      title: 'Changes Saved',
      description: `Ticket #${ticket?.ticketNumber}: Priority set to ${ticketPriority.toUpperCase()} and Agent ${assignedAgent} persisted.`,
    });
  };

  const handleSaveAndClose = () => {
    handleSaveChanges();
    onClose();
  };

  const getNextEscalationPriority = (current: TicketPriority): TicketPriority => {
    switch (current) {
      case 'low':
        return 'medium';
      case 'medium':
        return 'high';
      case 'high':
      case 'urgent':
      default:
        return 'urgent';
    }
  };

  const getNextLowerPriority = (current: TicketPriority): TicketPriority => {
    switch (current) {
      case 'urgent':
        return 'high';
      case 'high':
        return 'medium';
      case 'medium':
      case 'low':
      default:
        return 'low';
    }
  };

  const executeEscalation = () => {
    if (!ticketId || ticketPriority === 'urgent') return;

    const nextPriority = getNextEscalationPriority(ticketPriority);
    setTicketPriority(nextPriority);

    const newSlaMinutes = nextPriority === 'urgent' ? 15 : nextPriority === 'high' ? 180 : 480;
    setSecondsRemaining(newSlaMinutes * 60);

    updateStatusMutation.mutate(
      { ticketId, priority: nextPriority, status: 'in_progress' },
      {
        onSuccess: () => {
          sendReplyMutation.mutate({
            ticketId,
            payload: {
              message: `🚨 ESCALATION AUDIT: Ticket #${ticket?.ticketNumber} priority escalated from ${ticketPriority.toUpperCase()} to ${nextPriority.toUpperCase()}. SLA target updated to ${newSlaMinutes}m.`,
              isInternalNote: true,
            },
          });
          addToast({
            type: 'warning',
            title: nextPriority === 'urgent' ? 'Escalated to Highest Priority (Urgent)' : `Escalated to ${nextPriority.toUpperCase()}`,
            description: `Ticket #${ticket?.ticketNumber}: Priority set to ${nextPriority.toUpperCase()} SLA & Status updated to IN PROGRESS.`,
          });
        },
      }
    );
  };

  const handleDeescalate = () => {
    if (!ticketId || ticketPriority === 'low') return;

    const lowerPriority = getNextLowerPriority(ticketPriority);
    setTicketPriority(lowerPriority);

    const newSlaMinutes = lowerPriority === 'low' ? 1440 : lowerPriority === 'medium' ? 480 : 180;
    setSecondsRemaining(newSlaMinutes * 60);

    updateStatusMutation.mutate(
      { ticketId, priority: lowerPriority },
      {
        onSuccess: () => {
          sendReplyMutation.mutate({
            ticketId,
            payload: {
              message: `📉 DE-ESCALATION AUDIT: Ticket #${ticket?.ticketNumber} priority lowered from ${ticketPriority.toUpperCase()} to ${lowerPriority.toUpperCase()}. SLA target adjusted to ${newSlaMinutes}m.`,
              isInternalNote: true,
            },
          });
          addToast({
            type: 'info',
            title: `Priority Lowered to ${lowerPriority.toUpperCase()}`,
            description: `Ticket #${ticket?.ticketNumber}: Priority set to ${lowerPriority.toUpperCase()} SLA.`,
          });
        },
      }
    );
  };

  const handleResolve = () => {
    updateStatusMutation.mutate({ ticketId, status: 'resolved' });
    addToast({
      type: 'success',
      title: 'Ticket Resolved',
      description: `Ticket #${ticket?.ticketNumber}: Status updated to RESOLVED. SLA target met successfully.`,
    });
  };

  const handleConfirmMerge = (targetTicketNumber: string) => {
    if (!ticketId) return;
    const newEntry = {
      ticketNumber: targetTicketNumber,
      subject: `Merged inquiry thread consolidated into master`,
      mergedBy: 'Super Admin',
      mergedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMergedTicketsMap((prev) => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newEntry],
    }));

    addToast({
      type: 'info',
      title: 'Tickets Merged',
      description: `Ticket #${ticket?.ticketNumber}: Merged into Master Ticket #${targetTicketNumber}. Conversations consolidated.`,
    });
  };

  const handleUnmergeTicket = (childTicketNumber: string) => {
    if (!ticketId) return;

    setMergedTicketsMap((prev) => ({
      ...prev,
      [ticketId]: (prev[ticketId] || []).filter((item) => item.ticketNumber !== childTicketNumber),
    }));

    addToast({
      type: 'warning',
      title: 'Ticket Unmerged & Restored',
      description: `Ticket #${childTicketNumber} unmerged from Master Ticket #${ticket?.ticketNumber}. Restored as an independent active ticket.`,
    });
  };

  const handleAddFollowerConfirm = (followerName: string) => {
    if (!followers.includes(followerName)) {
      setFollowers([...followers, followerName]);
      addToast({
        type: 'success',
        title: 'Follower Added',
        description: `Ticket #${ticket?.ticketNumber}: Added ${followerName} to staff followers list.`,
      });
    }
  };

  const handleMarkSpam = () => {
    updateStatusMutation.mutate({ ticketId, status: 'closed' });
    addToast({
      type: 'error',
      title: 'Flagged as Spam / Fraud',
      description: `Ticket #${ticket?.ticketNumber}: Flagged as spam and Status updated to CLOSED.`,
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
      addToast({
        type: 'success',
        title: 'Tag Added',
        description: `Added #${newTagInput.trim()} tag.`,
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={hasUnsavedChanges ? handleSaveAndClose : onClose}
      title={ticket ? `${ticket.ticketNumber} - ${ticket.subject}` : 'Support Ticket Details'}
      subtitle={ticket ? `Reporter: ${ticket.reporterName} • ${ticket.entityName}` : 'Loading...'}
      size="xl"
    >
      {hasUnsavedChanges && (
        <div className="mb-4 p-3 bg-[#FEF3C7] border border-[#F59E0B]/40 rounded-xl flex items-center justify-between shadow-sm animate-pulse">
          <span className="text-xs font-bold text-[#D97706] flex items-center gap-1.5">
            <Save size={14} className="text-[#D97706]" /> You have unsaved changes (Priority / Agent). Click 'Save &amp; Close' to apply to ticket.
          </span>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-3 py-1.5 bg-[#C8A878] text-white text-xs font-bold rounded-lg shadow hover:bg-[#B38F55] cursor-pointer flex items-center gap-1"
          >
            Save &amp; Close Changes
          </button>
        </div>
      )}

      {isLoadingTicket || !ticket ? (
        <div className="p-12 text-center">
          <LoadingSpinner size="md" label="Loading enterprise ticket details..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ================= LEFT SIDE: Ticket Info & Workspace ================= */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Ticket Information Card */}
            <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <SupportTicketStatusBadge status={ticket.status} />

                  {/* Prominent Ticket Priority Badge */}
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs flex items-center gap-1.5 ${
                      ticketPriority === 'urgent'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : ticketPriority === 'high'
                        ? 'bg-amber-500 text-white'
                        : ticketPriority === 'medium'
                        ? 'bg-sky-700 text-white'
                        : 'bg-emerald-700 text-white'
                    }`}
                  >
                    <Flame size={13} className={ticketPriority === 'urgent' ? 'text-yellow-300' : 'text-white'} />
                    PRIORITY: {ticketPriority.toUpperCase()}
                  </span>

                  <Badge variant={ticket.userType === 'vendor' ? 'primary' : ticket.userType === 'user_vendor' ? 'warning' : 'neutral'}>
                    {ticket.userType === 'user_vendor' ? 'USER & VENDOR' : ticket.userType.toUpperCase()}
                  </Badge>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/40 flex items-center gap-1">
                    <Globe size={12} /> {ticket.source ? ticket.source.replace('_', ' ').toUpperCase() : 'LANDING WEBSITE'}
                  </span>
                </div>

                <span className="text-xs text-[#78716C] font-semibold">
                  Category: <strong className="text-[#211A19] uppercase">{ticket.category}</strong>
                </span>
              </div>

              <h2 className="text-base font-bold text-[#211A19] font-serif mt-1 leading-snug">
                {ticket.subject}
              </h2>

              <p className="text-xs text-[#211A19] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E7DFD5] leading-relaxed">
                {ticket.description}
              </p>

              {/* Vendor / User Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-[#E7DFD5]/60 pt-3 mt-1">
                <div>
                  <span className="text-[#78716C] block font-medium">Reporter Name:</span>
                  <button
                    type="button"
                    onClick={() => onOpenUserProfile && onOpenUserProfile(ticket.reporterName)}
                    className="font-bold text-[#211A19] hover:text-[#C8A878] underline text-left flex items-center gap-1 mt-0.5 cursor-pointer transition-colors"
                  >
                    <User size={13} className="text-[#C8A878]" /> {ticket.reporterName}
                  </button>
                </div>

                <div>
                  <span className="text-[#78716C] block font-medium">Email Address:</span>
                  <span className="font-bold text-[#211A19] flex items-center gap-1 mt-0.5">
                    <Mail size={13} className="text-[#C8A878]" /> {ticket.reporterEmail}
                  </span>
                </div>

                <div>
                  <span className="text-[#78716C] block font-medium">Phone Number:</span>
                  <span className="font-bold text-[#211A19] flex items-center gap-1 mt-0.5">
                    <Phone size={13} className="text-[#C8A878]" /> +91 98765 43210
                  </span>
                </div>

                {(ticket.userType === 'vendor' || ticket.userType === 'user_vendor') && (
                  <div>
                    <span className="text-[#78716C] block font-medium">Store Entity Account:</span>
                    <button
                      type="button"
                      onClick={() => onOpenVendorProfile && onOpenVendorProfile(ticket.entityName || '')}
                      className="font-bold text-[#211A19] hover:text-[#C8A878] underline text-left flex items-center gap-1 mt-0.5 cursor-pointer transition-colors"
                    >
                      <Store size={13} className="text-[#C8A878]" /> {ticket.entityName || 'Vendor Store'}
                    </button>
                  </div>
                )}

                {ticket.category === 'vendor_vs_user' ? (
                  <div className="col-span-2 bg-amber-50 p-3 rounded-xl border border-amber-200 flex flex-col gap-1 text-xs text-amber-950">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <Store size={14} className="text-amber-600" /> Vendor → Resident Customer Complaint
                      </span>
                      <Badge variant="warning">VENDOR &amp; RESIDENT</Badge>
                    </div>
                    <p className="mt-0.5">
                      Complainant <strong>{ticket.reporterName}</strong> (Store: {ticket.entityName}) filed a complaint against Resident Customer <strong className="text-[#211A19]">{ticket.reportedPartyName || 'Resident Customer'}</strong>.
                    </p>
                    {ticket.orderId && (
                      <span className="font-mono text-[11px] text-amber-800">Associated Order ID: {ticket.orderId} ({formatCurrency(ticket.orderAmount || 0)})</span>
                    )}
                  </div>
                ) : ticket.category === 'vendor_vs_vendor' ? (
                  <div className="col-span-2 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex flex-col gap-1 text-xs text-emerald-950">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Store size={14} className="text-emerald-600" /> Vendor → Vendor B2B Purchase Complaint
                      </span>
                      <Badge variant="primary">VENDOR &amp; RESIDENT</Badge>
                    </div>
                    <p className="mt-0.5">
                      Vendor <strong>{ticket.reporterName}</strong> (buying in resident role) filed a complaint against Vendor Store <strong className="text-[#211A19]">{ticket.reportedPartyName || ticket.targetVendor}</strong>.
                    </p>
                    {ticket.orderId && (
                      <span className="font-mono text-[11px] text-emerald-800">Associated Order ID: {ticket.orderId} ({formatCurrency(ticket.orderAmount || 0)})</span>
                    )}
                  </div>
                ) : ticket.category === 'user_vs_vendor' ? (
                  <div className="col-span-2 bg-rose-50 p-3 rounded-xl border border-rose-200 flex flex-col gap-1 text-xs text-rose-950">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                        <User size={14} className="text-rose-600" /> Resident Customer → Vendor Complaint
                      </span>
                      <Badge variant="danger">RESIDENT COMPLAINT</Badge>
                    </div>
                    <p className="mt-0.5">
                      Resident <strong>{ticket.reporterName}</strong> filed a complaint against Vendor Store <strong className="text-[#211A19]">{ticket.reportedPartyName || ticket.targetVendor}</strong>.
                    </p>
                    {ticket.orderId && (
                      <span className="font-mono text-[11px] text-rose-800">Associated Order ID: {ticket.orderId} ({formatCurrency(ticket.orderAmount || 0)})</span>
                    )}
                  </div>
                ) : ticket.userType === 'user_vendor' ? (
                  <div className="col-span-2 bg-[#EEE5DA]/90 p-2.5 rounded-xl border border-[#C8A878] flex items-center justify-between text-xs text-[#211A19]">
                    <div className="flex items-center gap-2">
                      <Store size={14} className="text-[#C8A878] shrink-0" />
                      <span>
                        <strong>Dual-Role Account:</strong> Registered as a <strong>Vendor &amp; Resident Customer</strong>.
                      </span>
                    </div>
                    <Badge variant="warning">VENDOR &amp; RESIDENT</Badge>
                  </div>
                ) : ticket.userType === 'vendor' ? (
                  <div className="col-span-2 bg-[#EEE5DA]/70 p-2.5 rounded-xl border border-[#C8A878]/40 flex items-center justify-between text-xs text-[#211A19]">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={14} className="text-[#C8A878] shrink-0" />
                      <span>
                        <strong>Vendor Intake Channel:</strong> App created exclusively for vendors (Vendor Mobile App &amp; Vendor Web Portal).
                      </span>
                    </div>
                    <Badge variant="primary">{ticket.source === 'mobile_app' ? 'VENDOR APP' : 'VENDOR PORTAL'}</Badge>
                  </div>
                ) : (
                  <div className="col-span-2 bg-[#FEF3C7]/60 p-2.5 rounded-xl border border-[#F59E0B]/40 flex items-center justify-between text-xs text-[#211A19]">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-[#D97706] shrink-0" />
                      <span>
                        <strong>User Intake Channel:</strong> Intake strictly from Website orders &amp; resident contact portal.
                      </span>
                    </div>
                    <Badge variant="warning">WEBSITE ONLY</Badge>
                  </div>
                )}

                {(ticket.orderId || ticket.category === 'billing' || ticket.category === 'technical') && (
                  <div className="col-span-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E7DFD5] flex items-center justify-between text-xs text-[#211A19] shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#211A19] text-[#C8A878] flex items-center justify-center font-bold shrink-0">
                        <ShoppingBag size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#211A19] flex items-center gap-1.5 font-mono">
                          Associated Order #{ticket.orderId || 'ORD-9842'}
                        </span>
                        <span className="text-[11px] text-[#78716C]">
                          Amount: <strong className="text-[#211A19] font-mono">₹{ticket.orderAmount || 707.00}</strong> • Status: In-Transit Delivery
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsOrderModalOpen(true)}
                      className="font-bold text-xs shrink-0"
                    >
                      View Order Details
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs border-t border-[#E7DFD5]/60 pt-3 mt-1">
                <span className="text-[#78716C]">Created: <strong>{formatDate(ticket.createdAt)}</strong></span>
                <span className="text-[#78716C]">Last Updated: <strong>{formatDate(ticket.updatedAt)}</strong></span>
              </div>
            </div>

            {/* Timeline Navigation Tabs */}
            <div className="flex items-center gap-1.5 border-b border-[#E7DFD5] pb-2">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'conversation'
                    ? 'bg-[#211A19] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                }`}
                onClick={() => setActiveTab('conversation')}
              >
                <MessageSquare size={14} /> Conversation ({messages.length})
              </button>

              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-[#211A19] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                }`}
                onClick={() => setActiveTab('notes')}
              >
                <Lock size={14} className="text-[#F59E0B]" /> Staff Notes Only
              </button>

              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'attachments'
                    ? 'bg-[#211A19] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                }`}
                onClick={() => setActiveTab('attachments')}
              >
                <Paperclip size={14} /> Attachments (2)
              </button>

              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'audit'
                    ? 'bg-[#211A19] text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                }`}
                onClick={() => setActiveTab('audit')}
              >
                <History size={14} /> Audit History
              </button>
            </div>

            {/* Conversation / Notes Content */}
            {activeTab === 'conversation' || activeTab === 'notes' ? (
              <div className="flex flex-col gap-3">
                {isLoadingMessages ? (
                  <div className="p-4 text-center">
                    <LoadingSpinner size="sm" label="Fetching thread..." />
                  </div>
                ) : (
                  messages
                    .filter((m) => activeTab === 'conversation' || m.isInternalNote)
                    .map((m) => {
                      const isAdmin = m.senderRole === 'admin' || m.senderRole === 'sub_admin';
                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                            m.isInternalNote
                              ? 'bg-[#FEF3C7] border-[#F59E0B]/40'
                              : isAdmin
                              ? 'bg-white border-[#C8A878]/60 ml-4'
                              : 'bg-[#FAF8F5] border-[#E7DFD5] mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              {m.isInternalNote ? (
                                <Lock size={12} className="text-[#D97706]" />
                              ) : (
                                <User size={12} className="text-[#78716C]" />
                              )}
                              <span className="font-bold text-[#211A19]">{m.senderName}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E7DFD5]/50 text-[#211A19] font-semibold uppercase">
                                {m.isInternalNote ? 'STAFF NOTE' : m.senderRole}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#78716C]">
                              {formatDate(m.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-[#211A19] whitespace-pre-wrap leading-relaxed">
                            {m.message}
                          </p>
                        </div>
                      );
                    })
                )}
              </div>
            ) : activeTab === 'attachments' ? (
              <div className="flex flex-col gap-2.5">
                <div className="p-3 bg-white border border-[#E7DFD5] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#C8A878]" />
                    <div>
                      <span className="font-bold text-[#211A19] block">razorpay_settlement_receipt.pdf</span>
                      <span className="text-[10px] text-[#78716C]">1.4 MB • Uploaded by {ticket.reporterName}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Download size={12} />}>
                    Download
                  </Button>
                </div>

                <div className="p-3 bg-white border border-[#E7DFD5] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#C8A878]" />
                    <div>
                      <span className="font-bold text-[#211A19] block">gate_scanner_error_log.txt</span>
                      <span className="text-[10px] text-[#78716C]">42 KB • System Diagnostic Log</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Download size={12} />}>
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 text-xs">
                <div className="p-3 bg-white border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
                  <span className="font-bold text-[#211A19]">Status Changed to IN_PROGRESS</span>
                  <span className="text-[#78716C] text-[11px]">Updated by Super Admin • {formatDate(ticket.updatedAt)}</span>
                </div>
                <div className="p-3 bg-white border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
                  <span className="font-bold text-[#211A19]">Ticket Created</span>
                  <span className="text-[#78716C] text-[11px]">Logged by {ticket.reporterName} • {formatDate(ticket.createdAt)}</span>
                </div>
              </div>
            )}

            {/* Response Form */}
            <form onSubmit={handleSendReply} className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider">
                  Dispatch Reply / Staff Note
                </span>

                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#D97706] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote || activeTab === 'notes'}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-[#E7DFD5]"
                  />
                  <Lock size={12} /> Internal Staff Note
                </label>
              </div>

              <textarea
                rows={3}
                placeholder={
                  isInternalNote || activeTab === 'notes'
                    ? 'Type an internal note visible only to admins...'
                    : 'Type your official support response...'
                }
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-[#211A19] outline-none focus:border-[#C8A878] resize-none"
              />

              <div className="flex items-center justify-between">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={sendReplyMutation.isPending}
                  leftIcon={<Send size={14} />}
                  disabled={!replyMessage.trim()}
                >
                  {isInternalNote || activeTab === 'notes' ? 'Save Internal Note' : 'Send Reply'}
                </Button>
              </div>
            </form>
          </div>

          {/* ================= RIGHT SIDE: Command & Control Panel ================= */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* SLA Timer Widget */}
            <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#211A19] flex items-center gap-1.5">
                  <Clock size={14} className="text-[#C8A878]" /> SLA Resolution Target
                </span>
                <Badge variant={secondsRemaining < 3600 ? 'danger' : 'success'}>
                  {secondsRemaining < 3600 ? 'SLA AT RISK' : 'SLA COMPLIANT'}
                </Badge>
              </div>

              <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-center">
                <span className="text-xl font-bold font-mono text-[#211A19]">
                  {formatSLATime(secondsRemaining)}
                </span>
                <span className="text-[10px] text-[#78716C] block mt-0.5">Live Countdown before SLA escalation breach</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-3">
              <h4 className="text-xs font-bold text-[#211A19] uppercase tracking-wider">
                Quick Command Actions
              </h4>

              {/* Assign Agent */}
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[#78716C] font-medium">Assigned Agent:</label>
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="text-[11px] font-bold text-[#C8A878] hover:underline"
                  >
                    Advanced Reassign
                  </button>
                </div>
                <select
                  value={assignedAgent}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs font-semibold text-[#211A19] outline-none cursor-pointer"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Vikram Mehta">Vikram Mehta (Tier 2)</option>
                  <option value="Ananya Sharma">Ananya Sharma (KYC Lead)</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>

              {/* Action Buttons Grid */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E7DFD5]/60">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      <Flame
                        size={14}
                        className={ticketPriority === 'urgent' ? 'text-gray-400' : 'text-rose-500'}
                      />
                    }
                    onClick={() => setIsEscalateConfirmOpen(true)}
                    isLoading={updateStatusMutation.isPending}
                    disabled={ticketPriority === 'urgent'}
                    title={
                      ticketPriority === 'urgent'
                        ? 'Ticket is already at the highest priority level (Urgent SLA)'
                        : `Escalate priority from ${ticketPriority.toUpperCase()} to ${getNextEscalationPriority(ticketPriority).toUpperCase()}`
                    }
                  >
                    {ticketPriority === 'urgent'
                      ? 'Highest Priority (Urgent 🔥)'
                      : `Escalate (${getNextEscalationPriority(ticketPriority).toUpperCase()}) 🚀`}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      <TrendingDown
                        size={14}
                        className={ticketPriority === 'low' ? 'text-gray-400' : 'text-sky-600'}
                      />
                    }
                    onClick={handleDeescalate}
                    isLoading={updateStatusMutation.isPending}
                    disabled={ticketPriority === 'low'}
                    title={
                      ticketPriority === 'low'
                        ? 'Ticket is already at the lowest priority level (Low SLA)'
                        : `Lower priority from ${ticketPriority.toUpperCase()} to ${getNextLowerPriority(ticketPriority).toUpperCase()}`
                    }
                  >
                    {ticketPriority === 'low'
                      ? 'Lowest Priority (Low)'
                      : `Lower (${getNextLowerPriority(ticketPriority).toUpperCase()}) 📉`}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<CheckCircle2 size={14} className="text-emerald-600" />}
                    onClick={handleResolve}
                    isLoading={updateStatusMutation.isPending}
                  >
                    Resolve
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<GitMerge size={14} />}
                    onClick={() => setIsMergeModalOpen(true)}
                  >
                    Merge
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<UserPlus size={14} />}
                    onClick={() => setIsAddFollowerModalOpen(true)}
                  >
                    Followers
                  </Button>
                </div>
              </div>

              {/* Followers List Display */}
              <div className="flex flex-col gap-1 text-xs pt-2 border-t border-[#E7DFD5]/60">
                <span className="text-[#78716C] font-medium block">Active Staff Followers ({followers.length}):</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {followers.map((f) => (
                    <span
                      key={f}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#EEE5DA] text-[#211A19] border border-[#C8A878]/40 flex items-center gap-1"
                    >
                      <User size={11} className="text-[#C8A878]" /> {f}
                      <button
                        type="button"
                        onClick={() => setFollowers(followers.filter((item) => item !== f))}
                        className="text-[#78716C] hover:text-rose-500 ml-0.5 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 size={14} className="text-rose-500" />}
                className="w-full text-rose-600 hover:bg-rose-50"
                onClick={handleMarkSpam}
              >
                Mark as Spam / Fraud
              </Button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Save size={14} />}
                className={`w-full font-bold transition-all ${
                  hasUnsavedChanges
                    ? 'bg-[#C8A878] text-white hover:bg-[#B38F55] shadow-md animate-pulse'
                    : 'bg-[#E7DFD5] text-[#78716C] cursor-not-allowed opacity-70'
                }`}
                disabled={!hasUnsavedChanges}
                onClick={handleSaveChanges}
              >
                {hasUnsavedChanges ? 'Save Unsaved Changes' : 'All Changes Saved'}
              </Button>
            </div>

            {/* Tags & Labels Card */}
            <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-2.5">
              <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={13} className="text-[#C8A878]" /> Ticket Tags
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold text-[#211A19] bg-[#FAF8F5] border border-[#E7DFD5] px-2 py-1 rounded-lg flex items-center gap-1"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-[#78716C] hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                placeholder="Type tag & press Enter..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full p-2 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-[#211A19] outline-none"
              />
            </div>

            {/* Merged Tickets & Consolidation History Card */}
            <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                  <GitMerge size={14} className="text-[#C8A878]" /> Merged Tickets History
                </span>
                <span className="text-[11px] font-bold text-[#C8A878] px-2 py-0.5 rounded-full bg-[#EEE5DA]">
                  {activeMergedList.length} Merged
                </span>
              </div>

              {activeMergedList.length === 0 ? (
                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-center">
                  <span className="text-xs text-[#78716C]">No child tickets merged into this master ticket yet.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-xs">
                  {activeMergedList.map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#C8A878]">#{m.ticketNumber}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">MERGED</span>
                        </div>
                        <span className="text-[#211A19] font-semibold text-[11px] truncate">{m.subject}</span>
                        <span className="text-[10px] text-[#78716C]">Merged by {m.mergedBy} • {m.mergedAt}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Unlink size={12} className="text-rose-600" />}
                        onClick={() => handleUnmergeTicket(m.ticketNumber)}
                        className="text-[11px] h-7 px-2 text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300 shrink-0 font-bold"
                      >
                        Unmerge
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Creator's Past Tickets Snapshot */}
            <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                  <History size={14} className="text-[#C8A878]" /> Past Tickets by {ticket?.reporterName} ({creatorPastTickets.length})
                </span>
              </div>

              {creatorPastTickets.length === 0 ? (
                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-center">
                  <span className="text-xs text-[#78716C]">First-time inquiry by {ticket?.reporterName}. No prior past tickets on record.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-xs">
                  {creatorPastTickets.map((pt) => (
                    <div
                      key={pt.id}
                      onClick={() => onSelectTicket && onSelectTicket(pt.id)}
                      className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#EEE5DA] hover:border-[#C8A878] transition-all shadow-xs"
                    >
                      <div className="flex flex-col min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#C8A878]">#{pt.ticketNumber}</span>
                          <span className="text-[10px] text-[#78716C]">• {formatDate(pt.createdAt)}</span>
                        </div>
                        <span className="text-[#211A19] font-semibold text-[11px] truncate">{pt.subject}</span>
                      </div>

                      <SupportTicketStatusBadge status={pt.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assignment System Modal */}
      <SupportAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        ticketId={ticketId}
        ticketNumber={ticket?.ticketNumber}
        currentAssignee={assignedAgent}
      />

      {/* Merge Ticket Modal */}
      <SupportMergeTicketModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        currentTicket={ticket}
        allTickets={allTickets}
        onConfirmMerge={handleConfirmMerge}
      />

      {/* Add Followers Modal */}
      <SupportAddFollowersModal
        isOpen={isAddFollowerModalOpen}
        onClose={() => setIsAddFollowerModalOpen(false)}
        ticketNumber={ticket?.ticketNumber}
        currentFollowers={followers}
        onAddFollower={handleAddFollowerConfirm}
      />

      {/* Associated Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        orderId={ticket?.orderId}
        ticket={ticket}
      />

      {/* Escalation Confirmation Warning Modal */}
      <Modal
        isOpen={isEscalateConfirmOpen}
        onClose={() => setIsEscalateConfirmOpen(false)}
        title="⚠️ Confirm Ticket Escalation"
        subtitle={`Ticket #${ticket?.ticketNumber} • Current Priority: ${ticketPriority.toUpperCase()}`}
      >
        <div className="flex flex-col gap-4 text-xs">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 leading-relaxed flex flex-col gap-2 shadow-2xs">
            <span className="font-bold text-amber-950 text-sm flex items-center gap-1.5 font-serif">
              <Flame size={16} className="text-rose-500" /> Priority Step Escalation Warning
            </span>
            <p>
              You are about to escalate Ticket <strong>#{ticket?.ticketNumber}</strong> from <strong>{ticketPriority.toUpperCase()}</strong> priority to <strong className="text-rose-700 font-bold uppercase">{getNextEscalationPriority(ticketPriority)}</strong> SLA priority.
            </p>
            <p className="text-[11px] text-amber-800 bg-white/70 p-2.5 rounded-xl border border-amber-200/60">
              ⚡ SLA Target will decrease to <strong>{getNextEscalationPriority(ticketPriority) === 'urgent' ? '15 minutes' : getNextEscalationPriority(ticketPriority) === 'high' ? '3 hours' : '8 hours'}</strong> and an internal staff escalation entry will be logged into the audit thread.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEscalateConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              leftIcon={<Flame size={14} className="text-rose-500" />}
              className="text-rose-700 hover:bg-rose-50 border-rose-300 font-bold"
              onClick={() => {
                setIsEscalateConfirmOpen(false);
                executeEscalation();
              }}
              isLoading={updateStatusMutation.isPending}
            >
              Confirm Escalation to {getNextEscalationPriority(ticketPriority).toUpperCase()} 🚀
            </Button>
          </div>
        </div>
      </Modal>
    </Drawer>
  );
};
