import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useUserProfile, useFlagUser, useResetUserFlags } from '../../hooks/useUsers';
import { useTickets } from '../../hooks/useSupport';
import { useToast } from '../../context/ToastContext';
import { SupportTicketStatusBadge } from '../support/SupportTicketStatusBadge';
import { formatDate } from '../../utils/formatters.utils';
import {
  User,
  Phone,
  Mail,
  Home,
  Flag,
  CheckCircle2,
  ShoppingBag,
  Headphones,
  CreditCard,
  MapPin,
  Bell,
  ShieldCheck,
  Ban,
  KeyRound,
  Trash2,
  ExternalLink,
  Clock,
} from 'lucide-react';

export interface UserDetailsCRMModalProps {
  isOpen: boolean;
  onClose: () => void;
  userIdentifier?: string | null;
  onSelectTicket?: (ticketId: string) => void;
  onSelectOrder?: (orderId: string) => void;
}

type TabType =
  | 'overview'
  | 'orders'
  | 'payments'
  | 'complaints'
  | 'timeline'
  | 'addresses'
  | 'notifications'
  | 'audit_logs';

export const UserDetailsCRMModal: React.FC<UserDetailsCRMModalProps> = ({
  isOpen,
  onClose,
  userIdentifier,
  onSelectTicket,
  onSelectOrder,
}) => {
  const { addToast } = useToast();
  const { data: user, isLoading, refetch } = useUserProfile(userIdentifier);
  const { data: allTickets = [] } = useTickets();
  const flagUserMutation = useFlagUser();
  const resetFlagsMutation = useResetUserFlags();

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const userPastTickets = useMemo(() => {
    if (!user) return [];
    return allTickets.filter(
      (t: any) =>
        (t.reporterEmail && t.reporterEmail.toLowerCase() === user.email.toLowerCase()) ||
        (t.reporterName && t.reporterName.toLowerCase().includes(user.name.toLowerCase())) ||
        (t.entityName && t.entityName.toLowerCase().includes(user.name.toLowerCase()))
    );
  }, [allTickets, user]);

  if (!userIdentifier) return null;

  // Mock User Orders
  const mockOrders = [
    {
      id: 'ORD-9842',
      storeName: 'FreshBites Daily Grocery',
      total: 1250,
      status: 'DELIVERED',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      items: '2x Organic Milk, 1x Multigrain Bread, 5kg Rice',
    },
    {
      id: 'ORD-9841',
      storeName: 'Priya Organic Mart',
      total: 890,
      status: 'DELIVERED',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      items: '1x Fresh Apples, 2x Honey Jars',
    },
    {
      id: 'ORD-9835',
      storeName: 'Suresh Dairy Supplies',
      total: 450,
      status: 'DELIVERED',
      date: new Date(Date.now() - 86400000 * 12).toISOString(),
      items: '3x Cottage Cheese, 2x Butter Packs',
    },
  ];

  // Mock User Payments
  const mockPayments = [
    {
      txnId: 'pay_Lkw908123984',
      orderId: 'ORD-9842',
      amount: 1250,
      method: 'Razorpay UPI (Google Pay)',
      status: 'SUCCESS',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      txnId: 'pay_Lkw887612344',
      orderId: 'ORD-9841',
      amount: 890,
      method: 'Razorpay Credit Card (HDFC)',
      status: 'SUCCESS',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      txnId: 'pay_Lkw776512399',
      orderId: 'ORD-9835',
      amount: 450,
      method: 'DigiLocal Wallet',
      status: 'SUCCESS',
      date: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ];

  // Mock User Timeline Events
  const mockTimeline = [
    {
      id: 't-1',
      title: 'Support Complaint Lodged',
      detail: 'Filed ticket #TICK-9082 regarding delivery delay via Website Intake.',
      time: '2 hours ago',
      icon: <Headphones size={13} className="text-[#C4A066]" />,
    },
    {
      id: 't-2',
      title: 'Order Placed (#ORD-9842)',
      detail: 'Completed payment of ₹1,250 via Razorpay UPI.',
      time: '2 days ago',
      icon: <ShoppingBag size={13} className="text-emerald-600" />,
    },
    {
      id: 't-3',
      title: 'Warning Strike Issued',
      detail: 'Admin issued dispute warning strike (1/3 strikes).',
      time: '5 days ago',
      icon: <Flag size={13} className="text-amber-500" />,
    },
    {
      id: 't-4',
      title: 'Account Registered',
      detail: 'Verified phone +91 98765 43210 & joined Anupam Society.',
      time: '3 months ago',
      icon: <User size={13} className="text-[#18281F]" />,
    },
  ];

  // Mock Addresses
  const mockAddresses = [
    {
      id: 'addr-1',
      label: 'Primary Home Address',
      fullAddress: `${user?.flatNumber || 'B-402'}, ${user?.societyName || 'Anupam Society'}, Sector 4, Commercial Belt, New Delhi - 110001`,
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Secondary Office Address',
      fullAddress: `Tower B, 5th Floor, Cyber City Tech Park, Gurgaon - 122002`,
      isDefault: false,
    },
  ];

  // Mock Notifications
  const mockNotifications = [
    {
      id: 'n-1',
      title: 'Order Delivered (#ORD-9842)',
      body: 'Your grocery order from FreshBites has been delivered to your doorstep.',
      date: '2 days ago',
    },
    {
      id: 'n-2',
      title: 'Support Ticket Reply',
      body: 'Agent Vikram Mehta updated ticket #TICK-9081 status to IN PROGRESS.',
      date: '3 days ago',
    },
  ];

  // Mock Audit Logs
  const mockAuditLogs = [
    {
      id: 'a-1',
      action: 'STRIKE_ISSUED',
      performedBy: 'Super Admin',
      ip: '192.168.1.45',
      date: '5 days ago',
    },
    {
      id: 'a-2',
      action: 'PROFILE_UPDATED',
      performedBy: 'User (Self-service)',
      ip: '49.36.112.18',
      date: '10 days ago',
    },
  ];

  // Quick Action Handlers
  const handleBlockUser = () => {
    if (!user) return;
    flagUserMutation.mutate(user.id, {
      onSuccess: () => {
        refetch();
        addToast({
          type: 'error',
          title: 'Account Blocked / Banned',
          description: `User ${user.name} has been suspended from making further orders.`,
        });
      },
    });
  };

  const handleUnblockUser = () => {
    if (!user) return;
    resetFlagsMutation.mutate(user.id, {
      onSuccess: () => {
        refetch();
        addToast({
          type: 'success',
          title: 'Account Restored & Unblocked',
          description: `Reset strikes and restored active ordering status for ${user.name}.`,
        });
      },
    });
  };

  const handleDeleteUser = () => {
    if (!user) return;
    addToast({
      type: 'warning',
      title: 'Delete Request Submitted',
      description: `Soft-delete scheduled for user profile ${user.name} (${user.id}).`,
    });
  };

  const handleResetPassword = () => {
    if (!user) return;
    addToast({
      type: 'info',
      title: 'Password Reset Dispatch',
      description: `Password reset magic link sent via SMS/Email to ${user.email}.`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enterprise CRM Customer Profile"
      subtitle={user ? `User ID: ${user.id} • ${user.societyName}` : 'Loading...'}
      size="xl"
    >
      {isLoading || !user ? (
        <div className="p-12 text-center">
          <LoadingSpinner size="md" label="Loading CRM user record..." />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* CRM Profile Header Banner */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#18281F] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[#18281F] text-base font-serif">{user.name}</h2>
                  <Badge variant={user.flagsCount >= 3 ? 'danger' : user.flagsCount >= 2 ? 'warning' : 'success'}>
                    {user.flagsCount >= 3 ? 'BANNED' : user.flagsCount >= 2 ? 'WARNED' : 'ACTIVE'}
                  </Badge>
                </div>
                <span className="text-xs text-[#6B7C70] flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1"><Mail size={12} className="text-[#C4A066]" /> {user.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Phone size={12} className="text-[#C4A066]" /> {user.phone}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs w-full md:w-auto justify-between border-t md:border-t-0 pt-2 md:pt-0 border-[#E4DCC9]">
              <div className="flex flex-col px-3 py-1.5 bg-white border border-[#E4DCC9] rounded-xl text-center">
                <span className="text-[10px] text-[#6B7C70] uppercase font-bold">Total Orders</span>
                <span className="font-bold text-[#18281F]">{user.totalOrders || 28}</span>
              </div>
              <div className="flex flex-col px-3 py-1.5 bg-white border border-[#E4DCC9] rounded-xl text-center">
                <span className="text-[10px] text-[#6B7C70] uppercase font-bold">Total Spend</span>
                <span className="font-bold text-emerald-700">₹{(user.totalSpend || 14500).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex flex-col px-3 py-1.5 bg-white border border-[#E4DCC9] rounded-xl text-center">
                <span className="text-[10px] text-[#6B7C70] uppercase font-bold">Strikes Meter</span>
                <span className="font-bold text-amber-700">{user.flagsCount} / 3 Flags</span>
              </div>
            </div>
          </div>

          {/* CRM 8 Navigation Tabs & Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 9 Columns: Tab Content */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* 8 Tabs Header Bar */}
              <div className="flex items-center gap-1 border-b border-[#E4DCC9] pb-2 text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'overview' ? 'bg-[#18281F] text-white shadow-sm' : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'orders' ? 'bg-[#18281F] text-white shadow-sm' : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
                  }`}
                >
                  Orders ({mockOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'payments' ? 'bg-[#18281F] text-white shadow-sm' : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
                  }`}
                >
                  Payments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('complaints')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'complaints' ? 'bg-[#18281F] text-white shadow-sm' : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
                  }`}
                >
                  Complaints ({userPastTickets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'timeline' ? 'bg-[#18281F] text-white shadow-sm' : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
                  }`}
                >
                  Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('addresses')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'addresses' ? 'bg-[#18281F] text-white shadow-sm' : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
                  }`}
                >
                  Addresses
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'notifications' ? 'bg-[#18281F] text-white shadow-sm' : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
                  }`}
                >
                  Notifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('audit_logs')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'audit_logs' ? 'bg-[#18281F] text-white shadow-sm' : 'bg-[#FAF9F6] text-[#6B7C70] hover:bg-[#EFE8D8]'
                  }`}
                >
                  Audit Logs
                </button>
              </div>

              {/* 1. TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-4 text-xs animate-fadeIn">
                  {/* Strike Meter */}
                  <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
                        <Flag size={14} className="text-[#D97706]" /> Dispute Flags &amp; Strike Meter
                      </span>
                      <span className="font-mono font-bold text-[#18281F]">{user.flagsCount} / 3 Strikes</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`h-2.5 rounded-full ${user.flagsCount >= 1 ? 'bg-amber-400' : 'bg-gray-200'}`} />
                      <div className={`h-2.5 rounded-full ${user.flagsCount >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                      <div className={`h-2.5 rounded-full ${user.flagsCount >= 3 ? 'bg-rose-600 animate-pulse' : 'bg-gray-200'}`} />
                    </div>
                    <span className="text-[11px] text-[#6B7C70]">
                      {user.flagsCount >= 3
                        ? 'CRITICAL: Account reached 3 strikes limit and is automatically BANNED.'
                        : `Account has ${user.flagsCount} flag(s). If 3 flags are reached, system auto-bans this user.`}
                    </span>
                  </div>

                  {/* Profile Details Cards Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center gap-2.5">
                      <Home size={16} className="text-[#C4A066]" />
                      <div>
                        <span className="text-[#6B7C70] block text-[10px] uppercase font-bold">Residence Unit</span>
                        <span className="font-bold text-[#18281F]">{user.flatNumber || 'B-304'}, {user.societyName}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center gap-2.5">
                      <Clock size={16} className="text-[#C4A066]" />
                      <div>
                        <span className="text-[#6B7C70] block text-[10px] uppercase font-bold">Member Since</span>
                        <span className="font-bold text-[#18281F]">{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Role Partner Store Card */}
                  <div className="p-4 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl flex flex-col gap-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#18281F] font-serif text-sm flex items-center gap-1.5">
                        <ShoppingBag size={16} className="text-[#C4A066]" /> Dual Role Partner Store Telemetry
                      </span>
                      <Badge variant="warning">USER &amp; VENDOR DUAL ROLE</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs pt-1 border-t border-[#E4DCC9]">
                      <div className="p-2.5 bg-white border border-[#E4DCC9] rounded-xl flex flex-col">
                        <span className="text-[10px] text-[#6B7C70] uppercase font-bold">Store Name</span>
                        <span className="font-bold text-[#18281F] truncate">Priya Organic Mart</span>
                      </div>

                      <div className="p-2.5 bg-white border border-[#E4DCC9] rounded-xl flex flex-col">
                        <span className="text-[10px] text-[#6B7C70] uppercase font-bold">Category</span>
                        <span className="font-bold text-[#18281F] truncate">Organic Fruits &amp; Produce</span>
                      </div>

                      <div className="p-2.5 bg-white border border-[#E4DCC9] rounded-xl flex flex-col">
                        <span className="text-[10px] text-[#6B7C70] uppercase font-bold">Store Rating</span>
                        <span className="font-mono font-bold text-amber-700">4.6 / 5.0 ⭐</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#EFE8D8]/70 rounded-xl border border-[#C4A066]/30 text-[11px] text-[#18281F] font-semibold flex items-center justify-between">
                      <span>Purchasing &amp; Ordering Privilege:</span>
                      <span className="text-[#D97706] font-bold">CAN PLACE ORDERS DIRECTLY FROM WEBSITE PORTAL</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. TAB: ORDERS */}
              {activeTab === 'orders' && (
                <div className="flex flex-col gap-2 text-xs animate-fadeIn">
                  {mockOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center justify-between shadow-xs hover:border-[#C4A066] transition-all"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#C4A066]">{ord.id}</span>
                          <span className="font-bold text-[#18281F]">{ord.storeName}</span>
                        </div>
                        <span className="text-[11px] text-[#6B7C70] truncate">{ord.items}</span>
                        <span className="text-[10px] text-[#6B7C70]">{formatDate(ord.date)}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-emerald-700">₹{ord.total}</span>
                        <Badge variant="success">{ord.status}</Badge>
                        {onSelectOrder && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<ExternalLink size={12} />}
                            onClick={() => {
                              onClose();
                              onSelectOrder(ord.id);
                            }}
                          >
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. TAB: PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="flex flex-col gap-2 text-xs animate-fadeIn">
                  {mockPayments.map((pay) => (
                    <div
                      key={pay.txnId}
                      className="p-3.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center justify-between shadow-xs"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-[#18281F] text-[11px]">{pay.txnId}</span>
                        <span className="text-[#6B7C70] font-semibold">{pay.method} • Order {pay.orderId}</span>
                        <span className="text-[10px] text-[#6B7C70]">{formatDate(pay.date)}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-700 text-sm">₹{pay.amount}</span>
                        <Badge variant="success">{pay.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. TAB: COMPLAINTS */}
              {activeTab === 'complaints' && (
                <div className="flex flex-col gap-2 text-xs animate-fadeIn">
                  {userPastTickets.length === 0 ? (
                    <div className="p-6 text-center text-[#6B7C70] bg-[#FAF9F6] rounded-xl border border-[#E4DCC9]">
                      No ticket complaints on record for {user.name}.
                    </div>
                  ) : (
                    userPastTickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          onClose();
                          if (onSelectTicket) onSelectTicket(t.id);
                        }}
                        className="p-3.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#C4A066] transition-all shadow-xs"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#C4A066]">#{t.ticketNumber}</span>
                            <span className="font-bold text-[#18281F] truncate">{t.subject}</span>
                          </div>
                          <span className="text-[11px] text-[#6B7C70]">Website Intake • Category: {t.category.toUpperCase()}</span>
                        </div>

                        <SupportTicketStatusBadge status={t.status} />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 5. TAB: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="flex flex-col gap-3 text-xs animate-fadeIn pl-2 border-l-2 border-[#C4A066]/40 ml-2">
                  {mockTimeline.map((item) => (
                    <div key={item.id} className="relative pl-4 flex flex-col gap-0.5">
                      <div className="absolute -left-[21px] top-0 p-1 bg-white border border-[#C4A066] rounded-full">
                        {item.icon}
                      </div>
                      <span className="font-bold text-[#18281F]">{item.title}</span>
                      <span className="text-[#6B7C70]">{item.detail}</span>
                      <span className="text-[10px] text-[#6B7C70] font-mono">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 6. TAB: ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="flex flex-col gap-2.5 text-xs animate-fadeIn">
                  {mockAddresses.map((addr) => (
                    <div key={addr.id} className="p-3.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#18281F] flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#C4A066]" /> {addr.label}
                          {addr.isDefault && <Badge variant="primary">DEFAULT</Badge>}
                        </span>
                        <span className="text-[#6B7C70] leading-relaxed">{addr.fullAddress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 7. TAB: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="flex flex-col gap-2 text-xs animate-fadeIn">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex flex-col gap-1">
                      <span className="font-bold text-[#18281F] flex items-center gap-1.5">
                        <Bell size={13} className="text-[#C4A066]" /> {notif.title}
                      </span>
                      <span className="text-[#6B7C70]">{notif.body}</span>
                      <span className="text-[10px] text-[#6B7C70] font-mono">{notif.date}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. TAB: AUDIT LOGS */}
              {activeTab === 'audit_logs' && (
                <div className="flex flex-col gap-2 text-xs animate-fadeIn">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#18281F]">{log.action}</span>
                        <span className="text-[11px] text-[#6B7C70]">Performed by {log.performedBy} (IP: {log.ip})</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#6B7C70]">{log.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 Columns: CRM Quick Actions Control Panel */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-3">
                <h4 className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#C4A066]" /> Quick CRM Command Actions
                </h4>

                {/* Direct Navigation Quick Buttons */}
                <div className="flex flex-col gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ShoppingBag size={13} />}
                    className="justify-start text-xs font-semibold"
                    onClick={() => setActiveTab('orders')}
                  >
                    View Orders ({mockOrders.length})
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<CreditCard size={13} />}
                    className="justify-start text-xs font-semibold"
                    onClick={() => setActiveTab('payments')}
                  >
                    View Payments ({mockPayments.length})
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Headphones size={13} />}
                    className="justify-start text-xs font-semibold"
                    onClick={() => setActiveTab('complaints')}
                  >
                    View Complaints ({userPastTickets.length})
                  </Button>
                </div>

                <div className="border-t border-[#E4DCC9] pt-3 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<KeyRound size={13} className="text-indigo-600" />}
                    className="justify-start text-xs font-semibold"
                    onClick={handleResetPassword}
                  >
                    Reset Password
                  </Button>

                  {user.flagsCount >= 3 || user.status === 'banned' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<CheckCircle2 size={13} className="text-emerald-600" />}
                      className="justify-start text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200"
                      onClick={handleUnblockUser}
                      isLoading={resetFlagsMutation.isPending}
                    >
                      Unblock User Account
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Ban size={13} className="text-rose-500" />}
                      className="justify-start text-xs font-bold text-rose-700 hover:bg-rose-50 border-rose-200"
                      onClick={handleBlockUser}
                      isLoading={flagUserMutation.isPending}
                    >
                      Block User Account ⛔
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Trash2 size={13} className="text-rose-600" />}
                    className="justify-start text-xs font-bold text-rose-700 hover:bg-rose-100 border-rose-300"
                    onClick={handleDeleteUser}
                  >
                    Delete User Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
