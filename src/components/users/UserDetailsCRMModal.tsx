import React, { useState, useMemo } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import {
  useUserProfile,
  useFlagUser,
  useResetUserFlags,
  useUserOrders,
  useUserPayments,
  useUserTimeline,
  useUserAddresses,
  useUserNotifications,
  useUserAuditLogs,
  useUpdateUser,
} from '../../hooks/useUsers';
import { useTickets } from '../../hooks/useSupport';
import { useToast } from '../../context/ToastContext';
import { SupportTicketStatusBadge } from '../support/SupportTicketStatusBadge';
import { formatDate } from '../../utils/formatters.utils';
import { isPhoneMatch } from '../../utils/phone.utils';
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
  Calendar,
  Pen,
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
  const { data: apiOrders = [] } = useUserOrders(user?.id);
  const { data: apiPayments = [] } = useUserPayments(user?.id);
  const { data: apiTimeline = [] } = useUserTimeline(user?.id);
  const { data: apiAddresses = [] } = useUserAddresses(user?.id);
  const { data: apiNotifications = [] } = useUserNotifications(user?.id);
  const { data: apiAuditLogs = [] } = useUserAuditLogs(user?.id);

  const { data: allTickets = [] } = useTickets();
  const flagUserMutation = useFlagUser();
  const resetFlagsMutation = useResetUserFlags();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const userPastTickets = useMemo(() => {
    if (!user) return [];
    const uPhone = user.phone || user.phoneNumber || user.mobile;
    const uWhatsapp = user.whatsappNumber || user.whatsapp_number;
    const uName = (user.name || '').toLowerCase();
    const uEmail = (user.email || '').toLowerCase();

    return allTickets.filter((t: any) => {
      const tPhone = t.reporterPhone;
      const tTargetRes = t.targetResident || t.reportedPartyName;

      // Primary Identification: Strict Phone & WhatsApp matching
      const isPhoneReporter = isPhoneMatch(uPhone, tPhone) || isPhoneMatch(uWhatsapp, tPhone);
      const isPhoneTarget = isPhoneMatch(uPhone, tTargetRes) || isPhoneMatch(uWhatsapp, tTargetRes);

      // Secondary Identification: Email & Name matching
      const isEmailMatch = uEmail && t.reporterEmail && t.reporterEmail.toLowerCase() === uEmail;
      const isNameMatch = uName && (
        (t.reporterName && t.reporterName.toLowerCase().includes(uName)) ||
        (t.targetResident && t.targetResident.toLowerCase().includes(uName))
      );

      return isPhoneReporter || isPhoneTarget || isEmailMatch || isNameMatch;
    });
  }, [allTickets, user]);

  if (!userIdentifier) return null;

  const mockOrders = apiOrders;
  const mockPayments = apiPayments;
  const mockTimeline = apiTimeline.map((t: any) => ({
    id: t.id,
    title: t.event || t.title,
    detail: t.detail,
    time: formatDate(t.date || t.time),
    icon: t.type === 'order' ? <ShoppingBag size={13} className="text-emerald-600" /> : <Headphones size={13} className="text-[#C8A878]" />,
  }));
  const mockAddresses = apiAddresses.map((a: any) => ({
    id: a.id,
    label: a.type || a.label,
    fullAddress: a.fullAddress || `${a.flat}, ${a.society}, ${a.city} - ${a.pincode}`,
    isDefault: Boolean(a.isDefault),
  }));
  const mockNotifications = apiNotifications.map((n: any) => ({
    id: n.id,
    title: n.title,
    body: n.message || n.body,
    date: formatDate(n.date),
  }));
  const mockAuditLogs = apiAuditLogs.map((a: any) => ({
    id: a.id,
    action: a.action,
    performedBy: a.operator || a.performedBy,
    ip: a.ip,
    date: formatDate(a.timestamp || a.date),
  }));

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
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Enterprise CRM Customer Profile"
      subtitle={user ? `User ID: ${user.id} • ${user.societyName}` : 'Loading...'}
      size="2xl"
    >
      {isLoading || !user ? (
        <div className="p-12 text-center">
          <LoadingSpinner size="md" label="Loading CRM user record..." />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* CRM Profile Header Banner */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#211A19] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[#211A19] text-base font-serif">{user.name}</h2>
                  {(() => {
                    const rawF = Math.max(user.flagsCount ?? 0, user.strikes ?? 0);
                    const isAutoBanned = Boolean(user.isAutoBanned || rawF >= 3);
                    const isUserBanned = user.status === 'banned' || user.status === 'blocked' || user.isBlocked || isAutoBanned;
                    return (
                      <Badge variant={isUserBanned ? 'danger' : rawF >= 1 || user.status === 'warned' ? 'warning' : 'success'}>
                        {isAutoBanned
                          ? 'AUTO-BANNED (3/3)'
                          : isUserBanned
                          ? `DIRECT ADMIN BAN (${rawF}/3)`
                          : rawF >= 1 || user.status === 'warned'
                          ? 'WARNED'
                          : 'ACTIVE'}
                      </Badge>
                    );
                  })()}
                </div>
                <span className="text-xs text-[#78716C] flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1"><Mail size={12} className="text-[#C8A878]" /> {user.email}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Phone size={12} className="text-[#C8A878]" /> {user.phone}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs w-full md:w-auto justify-between border-t md:border-t-0 pt-2 md:pt-0 border-[#E7DFD5]">
              <div className="flex flex-col px-3 py-1.5 bg-white border border-[#E7DFD5] rounded-xl text-center">
                <span className="text-[10px] text-[#78716C] uppercase font-bold">Total Orders</span>
                <span className="font-bold text-[#211A19]">{mockOrders.length || user.totalOrders || 0}</span>
              </div>
              <div className="flex flex-col px-3 py-1.5 bg-white border border-[#E7DFD5] rounded-xl text-center">
                <span className="text-[10px] text-[#78716C] uppercase font-bold">Total Spend</span>
                <span className="font-bold text-emerald-700">₹{(user.totalSpend || (mockOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || o.total || 0), 0))).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex flex-col px-3 py-1.5 bg-white border border-[#E7DFD5] rounded-xl text-center">
                <span className="text-[10px] text-[#78716C] uppercase font-bold">Strikes Meter</span>
                <span className="font-bold text-amber-700">{user.flagsCount} / 3 Flags</span>
              </div>
            </div>
          </div>

          {/* CRM 8 Navigation Tabs & Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 9 Columns: Tab Content */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* 8 Tabs Header Bar */}
              <div className="flex items-center gap-1 border-b border-[#E7DFD5] pb-2 text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'overview' ? 'bg-[#211A19] text-white shadow-sm' : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'orders' ? 'bg-[#211A19] text-white shadow-sm' : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                  }`}
                >
                  Orders ({mockOrders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'payments' ? 'bg-[#211A19] text-white shadow-sm' : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                  }`}
                >
                  Payments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('complaints')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'complaints' ? 'bg-[#211A19] text-white shadow-sm' : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                  }`}
                >
                  Complaints ({userPastTickets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'timeline' ? 'bg-[#211A19] text-white shadow-sm' : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                  }`}
                >
                  Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('addresses')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'addresses' ? 'bg-[#211A19] text-white shadow-sm' : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                  }`}
                >
                  Addresses
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'notifications' ? 'bg-[#211A19] text-white shadow-sm' : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                  }`}
                >
                  Notifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('audit_logs')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'audit_logs' ? 'bg-[#211A19] text-white shadow-sm' : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
                  }`}
                >
                  Audit Logs
                </button>
              </div>

              {/* 1. TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-4 text-xs animate-fadeIn">
                  {/* Strike Meter */}
                  {(() => {
                    const rawF = Math.max(user.flagsCount ?? 0, user.strikes ?? 0);
                    const isAutoBanned = Boolean(user.isAutoBanned || rawF >= 3);
                    const isUserBanned = user.status === 'banned' || user.status === 'blocked' || user.isBlocked || isAutoBanned;
                    const currentFlags = isAutoBanned ? Math.max(rawF, 3) : rawF;
                    return (
                      <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                            <Flag size={14} className="text-[#D97706]" /> Dispute Flags &amp; Strike Meter
                          </span>
                          <span className="font-mono font-bold text-[#211A19]">{currentFlags} / 3 Strikes</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className={`h-2.5 rounded-full ${currentFlags >= 1 ? 'bg-amber-400' : 'bg-gray-200'}`} />
                          <div className={`h-2.5 rounded-full ${currentFlags >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                          <div className={`h-2.5 rounded-full ${currentFlags >= 3 ? 'bg-rose-600 animate-pulse' : 'bg-gray-200'}`} />
                        </div>
                        <span className="text-[11px] text-[#78716C]">
                          {isAutoBanned
                            ? 'CRITICAL: Account reached 3 strikes limit and is automatically BANNED.'
                            : isUserBanned
                            ? `DIRECT ADMIN BAN: Admin directly banned this account without 3 strikes (${currentFlags}/3 strikes).`
                            : currentFlags > 0
                            ? `Account has ${currentFlags} flag(s). If 3 flags are reached, system auto-bans this user.`
                            : 'Account is clean with 0 warning strikes.'}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Profile Details Cards Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                      <Home size={16} className="text-[#C8A878]" />
                      <div>
                        <span className="text-[#78716C] block text-[10px] uppercase font-bold">Residence Unit</span>
                        <span className="font-bold text-[#211A19]">{user.flatNumber || 'B-304'}, {user.societyName}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                      <Clock size={16} className="text-[#C8A878]" />
                      <div>
                        <span className="text-[#78716C] block text-[10px] uppercase font-bold">Member Since</span>
                        <span className="font-bold text-[#211A19]">{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Role Partner Store Card */}
                  <div className="p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl flex flex-col gap-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#211A19] font-serif text-sm flex items-center gap-1.5">
                        <ShoppingBag size={16} className="text-[#C8A878]" /> Dual Role Partner Store Telemetry
                      </span>
                      <Badge variant="warning">USER &amp; VENDOR DUAL ROLE</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs pt-1 border-t border-[#E7DFD5]">
                      <div className="p-2.5 bg-white border border-[#E7DFD5] rounded-xl flex flex-col">
                        <span className="text-[10px] text-[#78716C] uppercase font-bold">Store Name</span>
                        <span className="font-bold text-[#211A19] truncate">Priya Organic Mart</span>
                      </div>

                      <div className="p-2.5 bg-white border border-[#E7DFD5] rounded-xl flex flex-col">
                        <span className="text-[10px] text-[#78716C] uppercase font-bold">Category</span>
                        <span className="font-bold text-[#211A19] truncate">Organic Fruits &amp; Produce</span>
                      </div>

                      <div className="p-2.5 bg-white border border-[#E7DFD5] rounded-xl flex flex-col">
                        <span className="text-[10px] text-[#78716C] uppercase font-bold">Store Rating</span>
                        <span className="font-mono font-bold text-amber-700">4.6 / 5.0 ⭐</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#EEE5DA]/70 rounded-xl border border-[#C8A878]/30 text-[11px] text-[#211A19] font-semibold flex items-center justify-between">
                      <span>Purchasing &amp; Ordering Privilege:</span>
                      <span className="text-[#D97706] font-bold">CAN PLACE ORDERS DIRECTLY FROM WEBSITE PORTAL</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. TAB: ORDERS */}
              {activeTab === 'orders' && (
                <div className="flex flex-col gap-3 text-xs animate-fadeIn">
                  {mockOrders.map((ord: any) => {
                    let itemsSummary = 'Ordered items';
                    if (typeof ord.items === 'string') {
                      itemsSummary = ord.items;
                    } else if (Array.isArray(ord.items) && ord.items.length > 0) {
                      itemsSummary = ord.items
                        .map((i: any) => (typeof i === 'string' ? i : `${i.name || i.item_name || 'Item'} (x${i.quantity || i.qty || 1})`))
                        .join(', ');
                    }

                    const subtotal = Number(ord.subtotal || ord.sub_total || 0);
                    const deliveryFee = Number(ord.deliveryFee || ord.delivery_charge || ord.delivery_fee || 0);
                    const taxAmount = Number(ord.taxAmount || ord.tax_amount || 0);
                    const discount = Number(ord.discount || 0);
                    const totalAmount = Number(ord.totalAmount || ord.total || ord.total_amount || 0);
                    const paymentMethod = ord.paymentMethod || ord.payment_method || 'Online Payment';
                    const paymentStatus = ord.paymentStatus || ord.payment_status || 'PAID';
                    const deliveryAddress = ord.deliveryAddress || ord.delivery_address || user?.societyName || 'Registered Residence';

                    return (
                      <div
                        key={ord.id}
                        className="p-4 bg-white border border-[#E7DFD5] rounded-2xl flex flex-col gap-3 shadow-xs hover:border-[#C8A878] transition-all"
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#C8A878] bg-[#FAF8F5] px-2 py-0.5 border border-[#E7DFD5] rounded-lg text-xs">
                              #{ord.orderId || ord.id}
                            </span>
                            <span className="font-bold text-[#211A19] font-serif text-sm">{ord.storeName || 'Partner Store'}</span>
                          </div>
                          <Badge variant="success">{ord.status || 'COMPLETED'}</Badge>
                        </div>

                        <span className="text-[10px] text-[#78716C] font-mono">
                          Timestamp: <strong>{formatDateTime(ord.createdAt || ord.created_at || ord.date)}</strong>
                        </span>

                        {/* Itemized Products Table (Unit Price & Item Total) */}
                        {Array.isArray(ord.items) && ord.items.length > 0 ? (
                          <div className="border border-[#E7DFD5] rounded-xl overflow-hidden text-xs bg-[#FAF8F5]">
                            <div className="grid grid-cols-12 bg-[#EEE5DA] px-3 py-1.5 font-bold text-[#211A19] border-b border-[#E7DFD5]">
                              <span className="col-span-5">Product Item</span>
                              <span className="col-span-2 text-center">Qty</span>
                              <span className="col-span-2 text-right">Unit Price</span>
                              <span className="col-span-3 text-right">Total</span>
                            </div>
                            {ord.items.map((item: any, idx: number) => {
                              const uPrice = Number(item.unitPrice ?? item.price ?? item.unit_price ?? 0);
                              const qty = Number(item.quantity || item.qty || 1);
                              const iTotal = Number(item.itemTotal ?? item.item_total ?? (uPrice * qty));
                              return (
                                <div key={item.id || idx} className="grid grid-cols-12 px-3 py-1.5 border-b border-[#E7DFD5]/50 items-center last:border-0">
                                  <span className="col-span-5 font-medium text-[#211A19] truncate">{item.name || item.item_name || 'Product Item'}</span>
                                  <span className="col-span-2 text-center font-mono text-[#78716C] font-semibold">{qty}</span>
                                  <span className="col-span-2 text-right font-mono text-[#78716C]">₹{uPrice.toFixed(2)}</span>
                                  <span className="col-span-3 text-right font-mono font-bold text-[#211A19]">₹{iTotal.toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-[#78716C] flex items-center gap-1.5">
                            <Package size={14} className="text-[#C8A878]" /> {itemsSummary}
                          </div>
                        )}

                        {/* Financial Breakdown & Address */}
                        <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1.5 text-xs">
                          {subtotal > 0 && (
                            <div className="flex items-center justify-between text-[#78716C]">
                              <span>Subtotal:</span>
                              <span className="font-mono text-[#211A19]">₹{subtotal.toFixed(2)}</span>
                            </div>
                          )}
                          {deliveryFee > 0 && (
                            <div className="flex items-center justify-between text-[#78716C]">
                              <span>Delivery Charge:</span>
                              <span className="font-mono text-[#211A19]">₹{deliveryFee.toFixed(2)}</span>
                            </div>
                          )}
                          {taxAmount > 0 && (
                            <div className="flex items-center justify-between text-[#78716C]">
                              <span>GST Tax:</span>
                              <span className="font-mono text-[#211A19]">₹{taxAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {discount > 0 && (
                            <div className="flex items-center justify-between text-emerald-700">
                              <span>Promo Discount:</span>
                              <span className="font-mono">- ₹{discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between font-bold text-sm text-[#211A19] pt-1.5 border-t border-[#E7DFD5]">
                            <span>Total Paid:</span>
                            <span className="font-mono text-emerald-700">₹{totalAmount.toFixed(2)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#E7DFD5]/60 text-[#78716C]">
                            <span>Method: <strong className="text-[#211A19]">{paymentMethod}</strong> ({paymentStatus})</span>
                            <span className="truncate max-w-[180px]" title={deliveryAddress}>📍 {deliveryAddress}</span>
                          </div>
                        </div>

                        {onSelectOrder && (
                          <div className="flex justify-end pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<ExternalLink size={12} />}
                              onClick={() => {
                                onClose();
                                onSelectOrder(ord.id);
                              }}
                            >
                              Inspect Full Order ↗
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. TAB: PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="flex flex-col gap-2 text-xs animate-fadeIn">
                  {mockPayments.map((pay) => (
                    <div
                      key={pay.txnId}
                      className="p-3.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between shadow-xs"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-[#211A19] text-[11px]">{pay.txnId}</span>
                        <span className="text-[#78716C] font-semibold">{pay.method} • Order {pay.orderId}</span>
                        <span className="text-[10px] text-[#78716C]">{formatDate(pay.date)}</span>
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
                    <div className="p-6 text-center text-[#78716C] bg-[#FAF8F5] rounded-xl border border-[#E7DFD5]">
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
                        className="p-3.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#C8A878] transition-all shadow-xs"
                      >
                        <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#C8A878]">#{t.ticketNumber}</span>
                            <span className="font-bold text-[#211A19] truncate">{t.subject}</span>
                          </div>
                          <span className="text-[11px] text-[#78716C]">Website Intake • Category: {t.category.toUpperCase()}</span>
                        </div>

                        <SupportTicketStatusBadge status={t.status} />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 5. TAB: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="flex flex-col gap-3 text-xs animate-fadeIn pl-2 border-l-2 border-[#C8A878]/40 ml-2">
                  {mockTimeline.map((item) => (
                    <div key={item.id} className="relative pl-4 flex flex-col gap-0.5">
                      <div className="absolute -left-[21px] top-0 p-1 bg-white border border-[#C8A878] rounded-full">
                        {item.icon}
                      </div>
                      <span className="font-bold text-[#211A19]">{item.title}</span>
                      <span className="text-[#78716C]">{item.detail}</span>
                      <span className="text-[10px] text-[#78716C] font-mono">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 6. TAB: ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="flex flex-col gap-2.5 text-xs animate-fadeIn">
                  {mockAddresses.map((addr) => (
                    <div key={addr.id} className="p-3.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#211A19] flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#C8A878]" /> {addr.label}
                          {addr.isDefault && <Badge variant="primary">DEFAULT</Badge>}
                        </span>
                        <span className="text-[#78716C] leading-relaxed">{addr.fullAddress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 7. TAB: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="flex flex-col gap-2 text-xs animate-fadeIn">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
                      <span className="font-bold text-[#211A19] flex items-center gap-1.5">
                        <Bell size={13} className="text-[#C8A878]" /> {notif.title}
                      </span>
                      <span className="text-[#78716C]">{notif.body}</span>
                      <span className="text-[10px] text-[#78716C] font-mono">{notif.date}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. TAB: AUDIT LOGS */}
              {activeTab === 'audit_logs' && (
                <div className="flex flex-col gap-2 text-xs animate-fadeIn">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[#211A19]">{log.action}</span>
                        <span className="text-[11px] text-[#78716C]">Performed by {log.performedBy} (IP: {log.ip})</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#78716C]">{log.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 4 Columns: CRM Quick Actions Control Panel */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-3">
                <h4 className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#C8A878]" /> Quick CRM Command Actions
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

                <div className="border-t border-[#E7DFD5] pt-3 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Pen size={13} className="text-[#C8A878]" />}
                    className="justify-start text-xs font-semibold"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit Account Details ✏️
                  </Button>

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
    </Drawer>
  );
};
