import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useVendors, useToggleVendorStatus } from '../../hooks/useVendors';
import { useTickets } from '../../hooks/useSupport';
import { useToast } from '../../context/ToastContext';
import { SupportTicketStatusBadge } from './SupportTicketStatusBadge';
import { formatDate } from '../../utils/formatters.utils';
import type { Vendor } from '../../types/vendor.types';
import { Store, User, Phone, Home, Star, CheckCircle2, ShoppingBag, Ban, Headphones, ChevronRight, History } from 'lucide-react';

export interface VendorProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorIdentifier?: string | null;
  onSelectTicket?: (ticketId: string) => void;
}

export const VendorProfileDetailsModal: React.FC<VendorProfileDetailsModalProps> = ({
  isOpen,
  onClose,
  vendorIdentifier,
  onSelectTicket,
}) => {
  const { addToast } = useToast();
  const { data: vendors = [], isLoading } = useVendors();
  const { data: allTickets = [] } = useTickets();
  const toggleVendorMutation = useToggleVendorStatus();
  const [showHistory, setShowHistory] = useState(false);

  // Find vendor by storeName or ID
  const foundVendor = vendors.find(
    (v) =>
      v.id === vendorIdentifier ||
      v.storeName.toLowerCase().includes((vendorIdentifier || '').toLowerCase())
  );

  const vendor: Vendor = foundVendor || {
    id: vendorIdentifier || 'v-101',
    storeName: vendorIdentifier || 'FreshBites Daily Grocery',
    ownerName: 'Rajesh Sharma',
    email: 'rajesh.freshbites@gmail.com',
    phone: '+91 98765 43210',
    address: 'Shop #12, Greenwood Commercial Block',
    societyName: 'Greenwood Heights Society',
    category: 'Daily Grocery & Produce',
    status: 'suspended',
    subscriptionTier: 'pro',
    subscriptionRenewalDate: new Date().toISOString(),
    gstin: '07ABCDE1234F1Z5',
    totalEarnings: 45000,
    totalOrdersCount: 142,
    avatarUrl: '',
    payments: [],
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ratingVal = (vendor as any).rating || 1.8;

  const vendorPastTickets = useMemo(() => {
    return allTickets.filter(
      (t) =>
        (t.entityName && t.entityName.toLowerCase().includes(vendor.storeName.toLowerCase())) ||
        (t.reporterName && t.reporterName.toLowerCase().includes(vendor.ownerName.toLowerCase())) ||
        (t.targetVendor && t.targetVendor.toLowerCase().includes(vendor.storeName.toLowerCase()))
    );
  }, [allTickets, vendor]);

  if (!vendorIdentifier) return null;

  const isBlocked = ratingVal < 2.0 || vendor.status === 'suspended';

  const handleRestoreVendor = () => {
    toggleVendorMutation.mutate(
      { vendorId: vendor.id, status: 'active' },
      {
        onSuccess: () => {
          addToast({
            type: 'success',
            title: 'Vendor Store Restored',
            description: `Store ${vendor.storeName} has been reinstated and unblocked.`,
          });
        },
      }
    );
  };

  const handleBlockVendor = () => {
    toggleVendorMutation.mutate(
      { vendorId: vendor.id, status: 'suspended' },
      {
        onSuccess: () => {
          addToast({
            type: 'error',
            title: 'Vendor Store Blocked',
            description: `Store ${vendor.storeName} rating (${ratingVal} ⭐) is below 2.0 threshold. Store blocked from taking new orders.`,
          });
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vendor Store Profile"
      subtitle={`Vendor ID: ${vendor.id} • Category: ${vendor.category}`}
    >
      {isLoading && !foundVendor ? (
        <div className="p-8 text-center">
          <LoadingSpinner size="md" label="Fetching vendor store details..." />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header Card */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E7DFD5] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#211A19] text-[#C8A878] flex items-center justify-center font-bold text-lg">
                <Store size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#211A19] text-sm flex items-center gap-1.5 font-serif">
                  {vendor.storeName}
                </span>
                <span className="text-xs text-[#78716C]">{vendor.email}</span>
              </div>
            </div>

            <Badge variant={isBlocked ? 'danger' : 'success'}>
              {isBlocked ? 'STORE BLOCKED (Rating < 2.0 ⭐)' : 'ACTIVE STORE'}
            </Badge>
          </div>

          {/* Rating Threshold Block Warning Meter */}
          <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                <Star size={14} className={isBlocked ? 'text-rose-500 fill-rose-500' : 'text-amber-500 fill-amber-500'} />
                Store Performance &amp; Auto-Block Threshold
              </span>
              <span className="text-xs font-bold font-mono text-[#211A19]">
                {ratingVal.toFixed(1)} / 5.0 ⭐
              </span>
            </div>

            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all ${
                  ratingVal < 2.0 ? 'bg-rose-600 animate-pulse' : ratingVal < 3.5 ? 'bg-amber-400' : 'bg-emerald-600'
                }`}
                style={{ width: `${(ratingVal / 5) * 100}%` }}
              />
            </div>

            <span className="text-[11px] text-[#78716C]">
              {isBlocked
                ? 'CRITICAL: Rating fell below 2.0 ⭐ threshold. Store is automatically BLOCKED from receiving orders.'
                : `Store rating is currently healthy (${ratingVal} ⭐). Auto-block triggers if rating drops below 2.0 ⭐.`}
            </span>
          </div>

          {/* Vendor Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
              <User size={16} className="text-[#C8A878]" />
              <div>
                <span className="text-[#78716C] block text-[10px] uppercase font-bold">Store Owner</span>
                <span className="font-bold text-[#211A19]">{vendor.ownerName}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
              <Phone size={16} className="text-[#C8A878]" />
              <div>
                <span className="text-[#78716C] block text-[10px] uppercase font-bold">Contact Phone</span>
                <span className="font-bold text-[#211A19]">{vendor.phone || '+91 98765 43210'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center gap-2.5">
              <Home size={16} className="text-[#C8A878]" />
              <div>
                <span className="text-[#78716C] block text-[10px] uppercase font-bold">Associated Society</span>
                <span className="font-bold text-[#211A19]">{vendor.societyName}</span>
              </div>
            </div>

            {/* Interactive Store Complaints / Tickets Card */}
            <div
              onClick={() => setShowHistory((prev) => !prev)}
              className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#EEE5DA] hover:border-[#C8A878] transition-all shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Headphones size={16} className="text-[#C8A878]" />
                <div>
                  <span className="text-[#78716C] block text-[10px] uppercase font-bold flex items-center gap-1">
                    Store Tickets <ChevronRight size={12} className={`transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                  </span>
                  <span className="font-bold text-[#211A19] underline">
                    {vendorPastTickets.length} Support Complaints
                  </span>
                </div>
              </div>
              <Badge variant="primary">VIEW HISTORY</Badge>
            </div>
          </div>

          {/* Ticket History Expansion Section */}
          {showHistory && (
            <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-2.5 animate-fadeIn">
              <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-[#C8A878]" /> Store Complaint History ({vendorPastTickets.length})
              </span>

              {vendorPastTickets.length === 0 ? (
                <div className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-center text-xs text-[#78716C]">
                  No ticket records on file for {vendor.storeName}.
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-xs">
                  {vendorPastTickets.map((pt) => (
                    <div
                      key={pt.id}
                      onClick={() => {
                        onClose();
                        if (onSelectTicket) onSelectTicket(pt.id);
                      }}
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
          )}

          {/* Unified Website Purchasing Privileges Card */}
          <div className="p-3 bg-[#EEE5DA]/70 border border-[#C8A878]/40 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={16} className="text-[#C8A878] shrink-0" />
              <div>
                <span className="font-bold text-[#211A19] block">Unified Website Ordering Privilege</span>
                <span className="text-[11px] text-[#78716C]">Can order from other partner stores directly using Vendor ID (No separate user login required)</span>
              </div>
            </div>
            <Badge variant="primary">SINGLE LOGIN</Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E7DFD5]">
            {isBlocked && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CheckCircle2 size={14} className="text-emerald-600" />}
                onClick={handleRestoreVendor}
                isLoading={toggleVendorMutation.isPending}
              >
                Unblock &amp; Restore Store
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Ban size={14} className="text-rose-500" />}
              className="text-rose-600 hover:bg-rose-50 border-rose-200 font-bold ml-auto"
              onClick={handleBlockVendor}
              isLoading={toggleVendorMutation.isPending}
              disabled={isBlocked}
            >
              {isBlocked ? 'Store Already Blocked' : 'Block Vendor Store ⛔'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
