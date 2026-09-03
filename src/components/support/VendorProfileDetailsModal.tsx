import React, { useState, useMemo } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useVendors, useToggleVendorStatus } from '../../hooks/useVendors';
import { useVendorDetails } from '../../hooks/useVendor';
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
  const { data: vendors = [], isLoading: isVendorsLoading } = useVendors();
  const { data: detailVendor, isLoading: isDetailLoading } = useVendorDetails(vendorIdentifier || '');
  const { data: allTickets = [] } = useTickets();
  const toggleVendorMutation = useToggleVendorStatus();
  const [showHistory, setShowHistory] = useState(false);

  // Memoize found vendor safely at top level
  const foundVendor = useMemo(() => {
    if (!vendorIdentifier) return null;
    return (
      detailVendor ||
      vendors.find(
        (v) =>
          v.id === vendorIdentifier ||
          v.storeName.toLowerCase().includes((vendorIdentifier || '').toLowerCase())
      ) ||
      null
    );
  }, [detailVendor, vendors, vendorIdentifier]);

  // Memoize past tickets safely at top level
  const vendorPastTickets = useMemo(() => {
    if (!foundVendor) return [];
    return allTickets.filter(
      (t) =>
        (t.entityName && t.entityName.toLowerCase().includes(foundVendor.storeName.toLowerCase())) ||
        (t.reporterName && t.reporterName.toLowerCase().includes(foundVendor.ownerName.toLowerCase())) ||
        (t.targetVendor && t.targetVendor.toLowerCase().includes(foundVendor.storeName.toLowerCase()))
    );
  }, [allTickets, foundVendor]);

  if (!isOpen || !vendorIdentifier) return null;

  if (!foundVendor) {
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Vendor Profile Details"
        subtitle={`Searching registry for ${vendorIdentifier}...`}
        size="xl"
      >
        <div className="p-8 text-center">
          <LoadingSpinner size="md" label="Loading vendor merchant profile..." />
        </div>
      </Drawer>
    );
  }

  const vendor: Vendor = foundVendor;
  const ratingVal = (vendor as any).rating || 1.8;
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

  const handleSuspendVendor = () => {
    toggleVendorMutation.mutate(
      { vendorId: vendor.id, status: 'suspended' },
      {
        onSuccess: () => {
          addToast({
            type: 'warning',
            title: 'Vendor Suspended',
            description: `Store ${vendor.storeName} status updated to suspended due to compliance review.`,
          });
        },
      }
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`${vendor.storeName} - Merchant Profile`}
      subtitle={`Owner: ${vendor.ownerName} • ${vendor.societyName || 'Network Vendor'}`}
      size="xl"
    >
      <div className="flex flex-col gap-5 p-4 text-xs font-sans">
        {/* Banner Alert for Blocked/Low Rated Vendors */}
        {isBlocked && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-950 shadow-2xs">
            <div className="flex items-center gap-3">
              <Ban size={20} className="text-rose-600 shrink-0" />
              <div>
                <span className="font-bold block text-rose-900 text-xs">
                  Merchant Under Operational Hold / Low Rating Strike ({ratingVal} ★)
                </span>
                <span className="text-[11px] text-rose-800 block mt-0.5">
                  Rating fell below 2.0★ thresholds or active dispute investigations exist. Store order intake is restricted.
                </span>
              </div>
            </div>
            {vendor.status === 'suspended' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRestoreVendor}
                isLoading={toggleVendorMutation.isPending}
                leftIcon={<CheckCircle2 size={14} />}
                className="bg-emerald-700 text-white hover:bg-emerald-800 shrink-0"
              >
                Reinstate Store
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={handleSuspendVendor}
                isLoading={toggleVendorMutation.isPending}
                leftIcon={<Ban size={14} />}
                className="shrink-0"
              >
                Suspend Store
              </Button>
            )}
          </div>
        )}

        {/* Vendor Header Card */}
        <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-[#541D26] font-bold text-lg">
              <Store size={24} className="text-[#C8A878]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#211A19] font-serif">{vendor.storeName}</h3>
                <Badge variant={vendor.status === 'active' ? 'success' : 'danger'}>
                  {vendor.status.toUpperCase()}
                </Badge>
              </div>
              <span className="text-xs text-[#78716C] flex items-center gap-1.5 mt-0.5">
                <User size={13} className="text-[#C8A878]" /> Owner: <strong>{vendor.ownerName}</strong> • Category: <strong className="uppercase">{vendor.category}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span className="text-[10px] text-amber-800 font-bold uppercase block">CSAT Rating</span>
              <span className="text-sm font-bold text-amber-900 font-mono flex items-center gap-1">
                <Star size={14} className="text-amber-500 fill-amber-500" /> {ratingVal} / 5.0
              </span>
            </div>
            <div className="p-2.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-center">
              <span className="text-[10px] text-[#78716C] font-bold uppercase block">Past Tickets</span>
              <span className="text-sm font-bold text-[#211A19] font-mono">{vendorPastTickets.length}</span>
            </div>
          </div>
        </div>

        {/* Contact & Store Operational Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
            <span className="text-[11px] text-[#78716C] font-semibold flex items-center gap-1">
              <Phone size={13} className="text-[#C8A878]" /> Phone Number
            </span>
            <span className="font-bold text-[#211A19] font-mono">{vendor.phone || '+91 98765 43210'}</span>
          </div>

          <div className="p-3 bg-white border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
            <span className="text-[11px] text-[#78716C] font-semibold flex items-center gap-1">
              <Home size={13} className="text-[#C8A878]" /> Society Hub
            </span>
            <span className="font-bold text-[#211A19] truncate">{vendor.societyName || 'Greenwood Residency'}</span>
          </div>

          <div className="p-3 bg-white border border-[#E7DFD5] rounded-xl flex flex-col gap-1">
            <span className="text-[11px] text-[#78716C] font-semibold flex items-center gap-1">
              <ShoppingBag size={13} className="text-[#C8A878]" /> Total Orders Fulfilled
            </span>
            <span className="font-bold text-[#211A19] font-mono">{vendor.totalOrders || 412} Orders</span>
          </div>
        </div>

        {/* Support History Snapshot */}
        <div className="p-4 bg-white border border-[#E7DFD5] rounded-2xl shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <History size={14} className="text-[#C8A878]" /> Support Tickets Involving Store ({vendorPastTickets.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              rightIcon={<ChevronRight size={14} className={showHistory ? 'rotate-90 transition-transform' : 'transition-transform'} />}
            >
              {showHistory ? 'Collapse History' : 'View Inquiries'}
            </Button>
          </div>

          {vendorPastTickets.length === 0 ? (
            <div className="p-4 text-center bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-[#78716C] text-xs font-medium">
              Clean Record: 0 support tickets or disputes filed against {vendor.storeName}.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {vendorPastTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTicket && onSelectTicket(t.id)}
                  className="p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl flex items-center justify-between gap-3 hover:bg-[#EEE5DA] hover:border-[#C8A878] transition-all cursor-pointer shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#C8A878] text-xs">{t.ticketNumber || t.id}</span>
                      <span className="text-[11px] text-[#78716C]">
                        • {formatDate(t.createdAt)}
                      </span>
                    </div>
                    <span className="font-bold text-[#211A19] block truncate text-xs mt-0.5">{t.subject}</span>
                    <span className="text-[11px] text-[#78716C] block truncate">
                      Reporter: {t.reporterName} ({t.userType})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <SupportTicketStatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7DFD5] mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close Drawer
          </Button>
          {isBlocked ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleRestoreVendor}
              isLoading={toggleVendorMutation.isPending}
              leftIcon={<CheckCircle2 size={14} />}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              Reinstate Vendor
            </Button>
          ) : (
            <Button
              type="button"
              variant="danger"
              onClick={handleSuspendVendor}
              isLoading={toggleVendorMutation.isPending}
              leftIcon={<Ban size={14} />}
            >
              Suspend Vendor Store
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
};
