import React, { useState, useMemo } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Modal } from '../common/Modal/Modal';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { usePersonDetails, useFlagPerson, useUpdatePersonStatus, useResetPersonStrikes } from '../../hooks/usePeople';
import { useUserOrders, useUpdateUser } from '../../hooks/useUsers';
import { useTickets } from '../../hooks/useSupport';
import { useVendors } from '../../hooks/useVendors';
import type { Vendor } from '../../types/vendor.types';
import { useToast } from '../../context/ToastContext';
import { SupportTicketStatusBadge } from '../support/SupportTicketStatusBadge';
import { OrderDetailsModal } from '../support/OrderDetailsModal';
import { formatDate, formatDateTime } from '../../utils/formatters.utils';
import {
  User,
  Store,
  Mail,
  Phone,
  Home,
  Flag,
  CheckCircle2,
  Ban,
  ShoppingBag,
  Headphones,
  History,
  ShieldAlert,
  Package,
  Clock,
  ExternalLink,
  Pen,
  X,
  AlertTriangle,
  Save,
  MapPin,
} from 'lucide-react';

export interface PeopleDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  personId?: string | null;
  onSelectVendor?: (vendor: Vendor) => void;
}

export const PeopleDetailsDrawer: React.FC<PeopleDetailsDrawerProps> = ({
  isOpen,
  onClose,
  personId,
  onSelectVendor,
}) => {
  const { addToast } = useToast();
  const { data: person, isLoading, refetch } = usePersonDetails(personId);
  const { data: apiOrders = [] } = useUserOrders(person?.id);
  const { data: allTickets = [] } = useTickets();
  const { data: allVendors = [] } = useVendors();
  const updateUserMutation = useUpdateUser();

  const linkedVendor = useMemo(() => {
    if (!person) return null;
    const pEmail = (person.email || '').toLowerCase();
    const pName = (person.name || '').toLowerCase();
    const pStore = (person.storeName || '').toLowerCase();

    return (
      allVendors.find((v) => {
        const vEmail = (v.email || '').toLowerCase();
        const vOwner = (v.ownerName || '').toLowerCase();
        const vStore = (v.storeName || '').toLowerCase();

        return (
          (pStore && vStore === pStore) ||
          (pEmail && vEmail === pEmail) ||
          (pName && vOwner === pName)
        );
      }) || null
    );
  }, [person, allVendors]);

  const flagMutation = useFlagPerson();
  const updateStatusMutation = useUpdatePersonStatus();
  const resetStrikesMutation = useResetPersonStrikes();

  const rawS = person ? Math.max(person.strikes ?? 0, person.flagsCount ?? 0) : 0;
  const isAutoBanned = person ? Boolean(person.isAutoBanned || rawS >= 3) : false;
  const isPersonBanned = person ? (person.status === 'banned' || person.status === 'blocked' || person.isBlocked || isAutoBanned) : false;
  const currentStrikesCount = isAutoBanned ? Math.max(rawS, 3) : rawS;

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'tickets'>('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showUserSaveConfirm, setShowUserSaveConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    societyName: '',
    flatNumber: '',
    address: '',
    status: 'active' as any,
  });

  const handleStartEdit = () => {
    if (person) {
      setEditForm({
        name: person.name || '',
        email: person.email || '',
        phone: person.phone || '',
        societyName: person.societyName || '',
        flatNumber: person.flatNumber || '',
        address: person.address || [person.flatNumber, person.societyName].filter(Boolean).join(', '),
        status: person.status || 'active',
      });
      setIsEditMode(true);
    }
  };

  const triggerUserSavePrompt = () => {
    setShowUserSaveConfirm(true);
  };

  const confirmUserSaveEdit = () => {
    if (!person) return;
    updateUserMutation.mutate(
      { userId: person.id, payload: editForm },
      {
        onSuccess: () => {
          setShowUserSaveConfirm(false);
          setIsEditMode(false);
          refetch();
          addToast({
            type: 'success',
            title: 'User Profile Updated',
            description: `Successfully saved profile updates for ${editForm.name || person.name} and refreshed page.`,
          });
        },
        onError: () => {
          setShowUserSaveConfirm(false);
          addToast({
            type: 'error',
            title: 'Update Failed',
            description: 'Could not update user details. Please try again.',
          });
        },
      }
    );
  };

  // Filter support tickets for this person directly from backend API
  const userTickets = useMemo(() => {
    if (!person) return [];
    return allTickets.filter(
      (t: any) =>
        (t.reporterEmail && t.reporterEmail.toLowerCase() === person.email.toLowerCase()) ||
        (t.reporterName && t.reporterName.toLowerCase().includes(person.name.toLowerCase())) ||
        (t.entityName && t.entityName.toLowerCase().includes(person.name.toLowerCase())) ||
        (person.storeName && t.entityName && t.entityName.toLowerCase().includes(person.storeName.toLowerCase()))
    );
  }, [allTickets, person]);

  const [selectedOrderIdForModal, setSelectedOrderIdForModal] = useState<string | null>(null);

  // Dynamic order history directly from API with complete itemized breakdown
  const orderHistory = useMemo(() => {
    if (!person) return [];
    return apiOrders.map((o: any) => {
      let itemsSummary = 'Ordered items';
      if (typeof o.items === 'string') {
        itemsSummary = o.items;
      } else if (Array.isArray(o.items) && o.items.length > 0) {
        itemsSummary = o.items
          .map((i: any) => (typeof i === 'string' ? i : `${i.name || i.item_name || 'Item'} (x${i.quantity || i.qty || 1})`))
          .join(', ');
      }

      return {
        id: o.id || o.orderId,
        orderId: o.orderId || o.id,
        storeName: o.storeName || o.vendorName || o.store_name || 'Store Order',
        vendorCategory: o.vendorCategory || o.category || 'General Store',
        items: Array.isArray(o.items) ? o.items : [],
        itemsSummary,
        subtotal: Number(o.subtotal || o.sub_total || 0),
        deliveryFee: Number(o.deliveryFee || o.delivery_charge || o.delivery_fee || 0),
        taxAmount: Number(o.taxAmount || o.tax_amount || 0),
        discount: Number(o.discount || 0),
        totalAmount: Number(o.totalAmount || o.total || o.total_amount || 0),
        paymentMethod: o.paymentMethod || o.payment_method || 'Online Payment',
        paymentStatus: o.paymentStatus || o.payment_status || 'PAID',
        deliveryAddress: o.deliveryAddress || o.delivery_address || person.address || [person.flatNumber, person.societyName].filter(Boolean).join(', ') || 'Registered Address',
        status: o.status || 'DELIVERED',
        date: formatDate(o.date || o.createdAt),
        dateTimeIST: formatDateTime(o.createdAt || o.created_at),
      };
    });
  }, [person, apiOrders]);

  const [showStrikePrompt, setShowStrikePrompt] = useState(false);
  const [showResetStrikePrompt, setShowResetStrikePrompt] = useState(false);
  const [showBanPrompt, setShowBanPrompt] = useState(false);

  const confirmIssueStrike = () => {
    if (!person) return;
    flagMutation.mutate(
      { id: person.id, reason: 'Policy violation / moderation strike' },
      {
        onSuccess: (res) => {
          setShowStrikePrompt(false);
          refetch();
          if (res.wasBanned) {
            addToast({
              type: 'error',
              title: 'Account Auto-Banned / Blocked (3/3 Strikes)',
              description: res.message || `${person.name} reached 3 strikes and has been AUTOMATICALLY BANNED / BLOCKED from platform access.`,
            });
          } else {
            addToast({
              type: 'warning',
              title: `Strike Issued (${res.person.flagsCount || res.person.strikes}/3 Strikes)`,
              description: res.message || `Strike #${res.person.flagsCount || res.person.strikes} issued to ${person.name}. ${3 - (res.person.flagsCount || res.person.strikes || 0)} strike(s) remaining before automatic ban.`,
            });
          }
        },
        onError: () => {
          setShowStrikePrompt(false);
          addToast({
            type: 'error',
            title: 'Action Failed',
            description: 'Failed to issue strike. Please try again.',
          });
        },
      }
    );
  };

  const confirmResetStrikes = () => {
    if (!person) return;
    resetStrikesMutation.mutate(person.id, {
      onSuccess: () => {
        setShowResetStrikePrompt(false);
        refetch();
        addToast({
          type: 'success',
          title: 'Strikes Reset Successfully',
          description: `All warning strikes for ${person.name} have been cleared and account status is ACTIVE.`,
        });
      },
      onError: () => {
        setShowResetStrikePrompt(false);
        addToast({
          type: 'error',
          title: 'Reset Failed',
          description: 'Failed to reset warning strikes. Please try again.',
        });
      },
    });
  };

  const confirmToggleBan = () => {
    if (!person) return;
    const isCurrentlyBanned = person.status === 'banned' || person.status === 'blocked' || person.isBlocked;
    const newStatus = isCurrentlyBanned ? 'active' : 'banned';

    updateStatusMutation.mutate(
      { id: person.id, status: newStatus },
      {
        onSuccess: () => {
          setShowBanPrompt(false);
          refetch();
          addToast({
            type: newStatus === 'banned' ? 'error' : 'success',
            title: newStatus === 'banned' ? 'Account Banned ⛔' : 'Account Re-Activated ⚡',
            description: `${person.name} is now ${newStatus.toUpperCase()}.`,
          });
        },
        onError: () => {
          setShowBanPrompt(false);
          addToast({
            type: 'error',
            title: 'Action Failed',
            description: 'Failed to update account status. Please try again.',
          });
        },
      }
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={person ? `User Profile: ${person.name}` : 'Loading...'}
      subtitle={person ? `ID: ${person.id} • ${person.societyName}` : 'Loading details...'}
      size="lg"
    >
      {isLoading || !person ? (
        <div className="p-12 text-center">
          <LoadingSpinner size="md" label="Fetching profile record..." />
        </div>
      ) : (
        <div className="flex flex-col gap-5 font-sans">
          {/* Header Identity Card */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#211A19] text-white flex items-center justify-center font-bold text-lg shrink-0">
                {person.name.charAt(0)}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-[#211A19] text-base font-serif flex items-center gap-2 flex-wrap">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="font-bold text-[#211A19] text-base border border-[#C8A878] rounded-xl px-3 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#541D26] w-full max-w-xs"
                      placeholder="Full Name"
                    />
                  ) : (
                    person.name
                  )}
                  {person.storeName && (
                    <span className="text-xs font-sans text-[#C8A878] font-bold">
                      ({person.storeName})
                    </span>
                  )}
                </span>
                <span className="text-xs text-[#78716C] truncate">{isEditMode ? editForm.email : person.email}</span>
              </div>
            </div>

            <Badge variant={isPersonBanned ? 'danger' : person.status === 'warned' ? 'warning' : 'success'}>
              {isAutoBanned
                ? 'AUTO-BANNED (3/3 STRIKES)'
                : isPersonBanned
                ? `DIRECT ADMIN BAN (${currentStrikesCount}/3 STRIKES)`
                : person.status.toUpperCase()}
            </Badge>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E7DFD5] pb-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#211A19] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
              }`}
            >
              Account Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'bg-[#211A19] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
              }`}
            >
              <History size={13} /> Activity &amp; Orders ({orderHistory.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tickets')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'tickets'
                  ? 'bg-[#211A19] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#78716C] hover:bg-[#EEE5DA]'
              }`}
            >
              <Headphones size={13} /> Support Tickets ({userTickets.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              {/* Strike Meter Card */}
              <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                    <Flag size={14} className="text-[#D97706]" /> Dispute Flags &amp; Strike Meter
                  </span>
                  <span className="text-xs font-mono font-bold text-[#211A19]">
                    {currentStrikesCount} / 3 Strikes
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className={`h-2.5 rounded-full ${currentStrikesCount >= 1 ? 'bg-amber-400' : 'bg-gray-200'}`} />
                  <div className={`h-2.5 rounded-full ${currentStrikesCount >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  <div className={`h-2.5 rounded-full ${currentStrikesCount >= 3 ? 'bg-rose-600 animate-pulse' : 'bg-gray-200'}`} />
                </div>

                <span className="text-[11px] text-[#78716C]">
                  {isAutoBanned
                    ? 'CRITICAL: Account reached 3 strikes limit and is automatically BANNED / BLOCKED from platform access.'
                    : isPersonBanned
                    ? `DIRECT ADMIN BAN: Admin directly banned this account without 3 strikes (${currentStrikesCount}/3 strikes recorded).`
                    : currentStrikesCount > 0
                    ? `Account has ${currentStrikesCount} flag(s). If 3 flags are reached, the system auto-bans this account.`
                    : 'Account is clean with 0 warning strikes.'}
                </span>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                  <Mail size={16} className="text-[#C8A878] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[#78716C] block text-[10px] uppercase font-bold">Email Address</span>
                    {isEditMode ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full text-xs font-bold text-[#211A19] border border-[#E7DFD5] rounded-lg px-2 py-1 bg-white focus:border-[#541D26] focus:outline-none"
                        placeholder="Email address"
                      />
                    ) : (
                      <span className="font-bold text-[#211A19] truncate block">{person.email}</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                  <Phone size={16} className="text-[#C8A878] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[#78716C] block text-[10px] uppercase font-bold">Phone Number</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full text-xs font-bold text-[#211A19] border border-[#E7DFD5] rounded-lg px-2 py-1 bg-white focus:border-[#541D26] focus:outline-none"
                        placeholder="Phone number"
                      />
                    ) : (
                      <span className="font-bold text-[#211A19]">{person.phone}</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                  <Home size={16} className="text-[#C8A878] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[#78716C] block text-[10px] uppercase font-bold">Society / Residence</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editForm.societyName}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, societyName: e.target.value }))}
                        className="w-full text-xs font-bold text-[#211A19] border border-[#E7DFD5] rounded-lg px-2 py-1 bg-white focus:border-[#541D26] focus:outline-none"
                        placeholder="Society/Area"
                      />
                    ) : (
                      <span className="font-bold text-[#211A19]">
                        {person.flatNumber ? `${person.flatNumber}, ` : ''}{person.societyName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
                  {person.personType === 'vendor' || person.personType === 'user_vendor' ? <Store size={16} className="text-[#C8A878] shrink-0" /> : <User size={16} className="text-[#C8A878] shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-[#78716C] block text-[10px] uppercase font-bold">Flat / Residence No.</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editForm.flatNumber}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, flatNumber: e.target.value }))}
                        className="w-full text-xs font-bold text-[#211A19] border border-[#E7DFD5] rounded-lg px-2 py-1 bg-white focus:border-[#541D26] focus:outline-none"
                        placeholder="Flat number"
                      />
                    ) : (
                      <span className="font-bold text-[#211A19]">{person.flatNumber || 'N/A'}</span>
                    )}
                  </div>
                </div>

                {/* Complete Detailed Address Field */}
                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-start gap-2.5 col-span-2">
                  <MapPin size={16} className="text-[#C8A878] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[#78716C] block text-[10px] uppercase font-bold">Complete Residential Address</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                        className="w-full text-xs font-bold text-[#211A19] border border-[#E7DFD5] rounded-lg px-2 py-1 bg-white focus:border-[#541D26] focus:outline-none"
                        placeholder="Full address (flat, area, city, pincode)"
                      />
                    ) : (
                      <span className="font-bold text-[#211A19] block text-xs leading-relaxed">
                        {person.address || [person.flatNumber, person.societyName].filter(Boolean).join(', ') || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5 col-span-2">
                  <Clock size={16} className="text-[#C8A878] shrink-0" />
                  <div>
                    <span className="text-[#78716C] block text-[10px] uppercase font-bold">Registration Timestamp (Account Created)</span>
                    <span className="font-bold text-[#211A19] font-mono">
                      {person.createdAtReadable || formatDateTime(person.createdAtIst || person.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dual Role Vendor Store Section */}
              {(person.personType === 'user_vendor' || person.storeName || linkedVendor) && (
                <div className="p-4 bg-[#EEE5DA] border border-[#C8A878]/50 rounded-2xl flex flex-col gap-3 shadow-xs text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider block">
                        Linked Merchant Account (Dual Role)
                      </span>
                      <span className="font-bold text-[#211A19] flex items-center gap-1.5 font-serif text-base mt-0.5">
                        <Store size={18} className="text-[#C8A878]" /> {linkedVendor?.storeName || person.storeName || 'Partner Merchant Store'}
                      </span>
                    </div>
                    <Badge variant="warning">USER &amp; VENDOR DUAL ROLE</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#78716C] pt-2 border-t border-[#C8A878]/30">
                    <div>
                      <span className="block font-bold text-[#211A19]">Merchant Category:</span>
                      <span>{linkedVendor?.category || person.category || 'Local Merchant'}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-[#211A19]">Merchant Account Status:</span>
                      <span className="font-bold text-[#211A19] uppercase">{linkedVendor?.status || 'Active'}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<ExternalLink size={13} />}
                      onClick={() => {
                        const targetVendor: Vendor = linkedVendor || {
                          id: person.id,
                          storeName: person.storeName || 'Partner Merchant Store',
                          ownerName: person.name,
                          category: person.category || 'General Merchant',
                          vendorType: 'product',
                          status: 'active',
                          email: person.email,
                          phone: person.phone,
                          address: person.societyName,
                          totalEarnings: 0,
                          totalOrdersCount: 0,
                          subscriptionTier: 'PRO',
                          createdAt: person.createdAt,
                          updatedAt: new Date().toISOString(),
                        };
                        onClose();
                        onSelectVendor?.(targetVendor);
                      }}
                    >
                      View Vendor Account Details ↗
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E7DFD5] flex-wrap">
                {isEditMode ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 size={14} />}
                      onClick={triggerUserSavePrompt}
                      isLoading={updateUserMutation.isPending}
                    >
                      Save Changes 💾
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(false)}
                    >
                      Cancel Edit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Pen size={14} className="text-[#C8A878]" />}
                      onClick={handleStartEdit}
                    >
                      Edit User Details ✏️
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Flag size={14} className="text-rose-500" />}
                      onClick={() => setShowStrikePrompt(true)}
                      isLoading={flagMutation.isPending}
                      disabled={currentStrikesCount >= 3 || person.isBlocked}
                    >
                      {(currentStrikesCount >= 3 || person.isBlocked)
                        ? 'Blocked (3/3 Strikes)'
                        : `Issue Strike 🚩 (${currentStrikesCount}/3)`}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<CheckCircle2 size={14} className="text-emerald-600" />}
                      onClick={() => setShowResetStrikePrompt(true)}
                      isLoading={resetStrikesMutation.isPending}
                    >
                      Reset Strikes ⚡
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={person.status === 'banned' || person.status === 'blocked' || person.isBlocked ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Ban size={14} className="text-rose-500" />}
                      onClick={() => setShowBanPrompt(true)}
                      isLoading={updateStatusMutation.isPending}
                    >
                      {person.status === 'banned' || person.status === 'blocked' || person.isBlocked ? 'Unban Account' : 'Ban Account ⛔'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ITEMIZED ACTIVITY & ORDERS HISTORY */}
          {activeTab === 'activity' && (
            <div className="flex flex-col gap-3 text-xs animate-fadeIn">
              <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between">
                <span className="font-bold text-[#211A19] flex items-center gap-1.5">
                  <ShoppingBag size={15} className="text-[#C8A878]" /> Personal Purchases &amp; Orders Log
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] border border-[#F59E0B]/40 rounded-lg">
                  🛒 PURCHASES AT OTHER STORES
                </span>
              </div>

              {orderHistory.map((ord: any) => (
                <div
                  key={ord.id}
                  className="p-4 bg-white border border-[#E7DFD5] rounded-2xl flex flex-col gap-3 shadow-xs hover:border-[#C8A878] transition-all"
                >
                  {/* Order Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#C8A878] bg-[#FAF8F5] px-2 py-0.5 border border-[#E7DFD5] rounded-lg text-xs">
                        #{ord.orderId || ord.id}
                      </span>
                      <span className="font-bold text-[#211A19] font-serif text-sm">{ord.storeName}</span>
                    </div>
                    <Badge variant="success">{ord.status}</Badge>
                  </div>

                  <span className="text-[10px] text-[#78716C] font-mono">
                    Timestamp: <strong>{ord.dateTimeIST}</strong>
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
                      <Package size={14} className="text-[#C8A878]" /> {ord.itemsSummary}
                    </div>
                  )}

                  {/* Financial Breakdown & Address */}
                  <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex flex-col gap-1.5 text-xs">
                    {ord.subtotal > 0 && (
                      <div className="flex items-center justify-between text-[#78716C]">
                        <span>Subtotal:</span>
                        <span className="font-mono text-[#211A19]">₹{ord.subtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {ord.deliveryFee > 0 && (
                      <div className="flex items-center justify-between text-[#78716C]">
                        <span>Delivery &amp; Logistics Charge:</span>
                        <span className="font-mono text-[#211A19]">₹{ord.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    {ord.taxAmount > 0 && (
                      <div className="flex items-center justify-between text-[#78716C]">
                        <span>Platform GST Tax:</span>
                        <span className="font-mono text-[#211A19]">₹{ord.taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {ord.discount > 0 && (
                      <div className="flex items-center justify-between text-emerald-700">
                        <span>Vendor Discount:</span>
                        <span className="font-mono">- ₹{ord.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-bold text-sm text-[#211A19] pt-1.5 border-t border-[#E7DFD5]">
                      <span>Paid Order Total:</span>
                      <span className="font-mono text-emerald-700">₹{ord.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#E7DFD5]/60 text-[#78716C]">
                      <span>Payment: <strong className="text-[#211A19]">{ord.paymentMethod}</strong> ({ord.paymentStatus})</span>
                      <span className="truncate max-w-[180px]" title={ord.deliveryAddress}>📍 {ord.deliveryAddress}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<ExternalLink size={12} />}
                      onClick={() => setSelectedOrderIdForModal(ord.id)}
                    >
                      Inspect Full Order ↗
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ITEMIZED SUPPORT TICKET LOGS */}
          {activeTab === 'tickets' && (
            <div className="flex flex-col gap-3 text-xs animate-fadeIn">
              <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between">
                <span className="font-bold text-[#211A19] flex items-center gap-1.5">
                  <ShieldAlert size={15} className="text-[#C8A878]" /> Support Ticket Inquiries ({userTickets.length})
                </span>
                <span className="text-[#78716C]">Intake: Website &amp; App</span>
              </div>

              {userTickets.map((t: any) => (
                <div
                  key={t.id}
                  className="p-3.5 bg-white border border-[#E7DFD5] rounded-2xl flex flex-col gap-2 shadow-xs hover:border-[#C8A878] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#C8A878] bg-[#FAF8F5] px-2 py-0.5 border border-[#E7DFD5] rounded-lg">
                        #{t.ticketNumber || t.id}
                      </span>
                      <Badge variant="primary">{t.category?.toUpperCase() || 'GENERAL'}</Badge>
                      {t.reporterType && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded text-[#78716C]">
                          {t.reporterType} INTAKE
                        </span>
                      )}
                    </div>
                    <SupportTicketStatusBadge status={t.status || 'OPEN'} />
                  </div>

                  <span className="font-bold text-[#211A19] text-xs">{t.subject}</span>

                  <div className="flex items-center justify-between text-[10px] text-[#78716C] pt-1.5 border-t border-[#E7DFD5]/60">
                    <span>Reporter: {t.reporterName || person.name}</span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Edit Save Confirmation Warning Modal */}
      <Modal
        isOpen={showUserSaveConfirm}
        onClose={() => setShowUserSaveConfirm(false)}
        title="⚠️ Confirm User Account Details Update"
        subtitle={`Target Account: ${editForm.name || person?.name}`}
        size="sm"
      >
        <div className="flex flex-col gap-4 p-4 text-xs font-sans">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to update the profile details for <strong>{editForm.name || person?.name}</strong>?
              This action will save the modified parameters directly to the live backend database and refresh the page view.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUserSaveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save size={14} />}
              isLoading={updateUserMutation.isPending}
              onClick={confirmUserSaveEdit}
            >
              Yes, Save Changes 💾
            </Button>
          </div>
        </div>
      </Modal>

      {/* Strike Warning Confirmation Modal */}
      <Modal
        isOpen={showStrikePrompt}
        onClose={() => setShowStrikePrompt(false)}
        title="🚩 Issue Account Strike Warning"
        subtitle={person ? `Target: ${person.name} (${person.id})` : ''}
        size="sm"
      >
        <div className="flex flex-col gap-4 p-4 text-xs font-sans">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-bold text-rose-900">
                Warning: You are about to issue a formal strike flag to {person?.name}.
              </span>
              <span>
                Current Strike Meter: <strong>{currentStrikesCount} / 3 Strikes</strong>.
                If an account reaches 3 strikes, it will be automatically BANNED / BLOCKED from platform access.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStrikePrompt(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Flag size={14} className="text-white" />}
              className="bg-rose-700 hover:bg-rose-800 text-white border-rose-800"
              isLoading={flagMutation.isPending}
              onClick={confirmIssueStrike}
            >
              Yes, Issue Strike 🚩
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Strikes Warning Confirmation Modal */}
      <Modal
        isOpen={showResetStrikePrompt}
        onClose={() => setShowResetStrikePrompt(false)}
        title="⚡ Confirm Reset Warning Strikes"
        subtitle={person ? `Target Account: ${person.name} (${person.id})` : ''}
        size="sm"
      >
        <div className="flex flex-col gap-4 p-4 text-xs font-sans">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-bold text-amber-900">
                Warning: Are you sure you want to reset all warning strikes for {person?.name}?
              </span>
              <span>
                This action will reset the strike count from <strong>{currentStrikesCount} / 3 Strikes</strong> to <strong>0 / 3 Strikes</strong> and reactivate the account.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetStrikePrompt(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 size={14} className="text-white" />}
              className="bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800"
              isLoading={resetStrikesMutation.isPending}
              onClick={confirmResetStrikes}
            >
              Yes, Reset Strikes ⚡
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ban / Unban Account Warning Confirmation Modal */}
      <Modal
        isOpen={showBanPrompt}
        onClose={() => setShowBanPrompt(false)}
        title={person?.status === 'banned' || person?.status === 'blocked' || person?.isBlocked ? '⚡ Confirm Account Unban' : '⛔ Confirm Account Ban / Suspension'}
        subtitle={person ? `Target Account: ${person.name} (${person.id})` : ''}
        size="sm"
      >
        <div className="flex flex-col gap-4 p-4 text-xs font-sans">
          <div className={`p-3.5 border rounded-xl flex items-start gap-2.5 ${person?.status === 'banned' || person?.status === 'blocked' || person?.isBlocked ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'}`}>
            <AlertTriangle size={18} className={`shrink-0 mt-0.5 ${person?.status === 'banned' || person?.status === 'blocked' || person?.isBlocked ? 'text-emerald-600' : 'text-rose-600'}`} />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-bold">
                {person?.status === 'banned' || person?.status === 'blocked' || person?.isBlocked
                  ? `Are you sure you want to unban ${person?.name}?`
                  : `Warning: Are you sure you want to BAN ${person?.name}?`}
              </span>
              <span>
                {person?.status === 'banned' || person?.status === 'blocked' || person?.isBlocked
                  ? 'This will restore user access to place orders across the platform.'
                  : 'Banning will immediately revoke user access, invalidate active login sessions, and block order placement.'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBanPrompt(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={person?.status === 'banned' || person?.status === 'blocked' || person?.isBlocked ? <CheckCircle2 size={14} className="text-white" /> : <Ban size={14} className="text-white" />}
              className={person?.status === 'banned' || person?.status === 'blocked' || person?.isBlocked ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800' : 'bg-rose-700 hover:bg-rose-800 text-white border-rose-800'}
              isLoading={updateStatusMutation.isPending}
              onClick={confirmToggleBan}
            >
              {person?.status === 'banned' || person?.status === 'blocked' || person?.isBlocked ? 'Yes, Unban Account ⚡' : 'Yes, Ban Account ⛔'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Order Details Inspection Modal */}
      <OrderDetailsModal
        isOpen={Boolean(selectedOrderIdForModal)}
        onClose={() => setSelectedOrderIdForModal(null)}
        orderId={selectedOrderIdForModal}
      />
    </Drawer>
  );
};
