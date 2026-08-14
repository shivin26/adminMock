import React from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Badge } from '../common/Badge/Badge';
import { Button } from '../common/Button/Button';
import type { Vendor } from '../../types/vendor.types';
import { formatCurrency, formatDate, getStatusBadgeVariant } from '../../utils/formatters.utils';
import { Store, CreditCard, Mail, Phone, MapPin, ShoppingBag, User } from 'lucide-react';

export interface VendorDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleBlock?: (vendor: Vendor) => void;
  onSelectOwner?: (ownerName: string, vendor: Vendor) => void;
  vendor?: Vendor | null;
}

export const VendorDetailsDrawer: React.FC<VendorDetailsDrawerProps> = ({
  isOpen,
  onClose,
  onToggleBlock,
  onSelectOwner,
  vendor,
}) => {
  if (!vendor) return null;

  const aov = vendor.totalOrdersCount > 0
    ? Math.round(vendor.totalEarnings / vendor.totalOrdersCount)
    : 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={vendor.storeName}
      subtitle={
        <span className="flex items-center gap-1.5 text-xs text-amber-200/90 font-medium">
          Owner:
          <button
            type="button"
            onClick={() => onSelectOwner?.(vendor.ownerName, vendor)}
            className="font-bold text-[#C4A066] hover:text-white underline cursor-pointer transition-all inline-flex items-center gap-0.5"
            title="Click to view Owner profile details"
          >
            {vendor.ownerName} ↗
          </button>
        </span>
      }
    >
      <div className="flex flex-col gap-5 p-1">
        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm">
          <img
            src={vendor.avatarUrl}
            alt={vendor.storeName}
            className="w-14 h-14 rounded-xl object-cover border border-[#E4DCC9]"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-[#18281F] truncate">{vendor.storeName}</h4>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs">
              <User size={12} className="text-[#C4A066]" />
              <span className="text-[#6B7C70]">Owner:</span>
              <button
                type="button"
                onClick={() => onSelectOwner?.(vendor.ownerName, vendor)}
                className="font-bold text-[#18281F] hover:text-[#C4A066] underline cursor-pointer transition-colors"
                title="Click to view Owner details"
              >
                {vendor.ownerName}
              </button>
            </div>
            <p className="text-xs text-[#6B7C70] flex items-center gap-1 mt-0.5">
              <Mail size={12} className="text-[#C4A066]" /> {vendor.email}
            </p>
            <p className="text-xs text-[#6B7C70] flex items-center gap-1 mt-0.5">
              <Phone size={12} className="text-[#C4A066]" /> {vendor.phone}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusBadgeVariant(vendor.status)}>
              {vendor.status.toUpperCase()}
            </Badge>
            {onToggleBlock && (
              <Button
                size="sm"
                variant={vendor.status === 'suspended' ? 'primary' : 'danger'}
                onClick={() => onToggleBlock(vendor)}
              >
                {vendor.status === 'suspended' ? 'Unblock' : 'Block'}
              </Button>
            )}
          </div>
        </div>

        {/* Order Performance & Revenue Analytics Card */}
        <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-3">
          <h5 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag size={14} className="text-[#C4A066]" /> Order Performance & Revenue Metrics
          </h5>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-center">
              <span className="text-xs text-[#6B7C70] font-medium block">Total Orders</span>
              <span className="text-base font-extrabold text-[#18281F] mt-1 block">
                {vendor.totalOrdersCount.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-center">
              <span className="text-xs text-[#6B7C70] font-medium block">Total Revenue</span>
              <span className="text-base font-extrabold text-[#10B981] mt-1 block">
                {formatCurrency(vendor.totalEarnings)}
              </span>
            </div>
            <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-center">
              <span className="text-xs text-[#6B7C70] font-medium block">Avg Order Value</span>
              <span className="text-base font-extrabold text-[#18281F] mt-1 block">
                {formatCurrency(aov)}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Society Details */}
        <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-2">
          <h5 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <MapPin size={14} className="text-[#C4A066]" /> Location & Assigned Society
          </h5>
          <div className="flex justify-between items-center text-sm border-b border-[#E4DCC9]/60 pb-2">
            <span className="text-[#6B7C70] font-medium">Assigned Society:</span>
            <span className="text-[#18281F] font-bold">{vendor.societyName}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-[#E4DCC9]/60 pb-2">
            <span className="text-[#6B7C70] font-medium">Store Address:</span>
            <span className="text-[#18281F] font-semibold">{vendor.address}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#6B7C70] font-medium">GSTIN Tax Code:</span>
            <span className="font-mono text-[#18281F] text-xs font-bold">{vendor.gstin}</span>
          </div>
        </div>

        {/* Subscription Summary */}
        <div className="p-4 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-2">
          <h5 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Store size={14} className="text-[#C4A066]" /> Subscription Summary
          </h5>
          <div className="flex justify-between items-center text-sm border-b border-[#E4DCC9]/60 pb-2">
            <span className="text-[#6B7C70] font-medium">Subscription Status:</span>
            <Badge variant={vendor.status === 'active' || vendor.subscriptionTier === 'subscribed' ? 'success' : 'warning'}>
              {vendor.status === 'active' || vendor.subscriptionTier === 'subscribed' ? 'SUBSCRIBED' : 'NOT SUBSCRIBED'}
            </Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#6B7C70] font-medium">Next Renewal Date:</span>
            <span className="text-[#18281F] font-semibold">{formatDate(vendor.subscriptionRenewalDate)}</span>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="flex flex-col gap-3">
          <h5 className="text-xs font-bold text-[#6B7C70] uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={14} className="text-[#C4A066]" /> Payment Receipts History
          </h5>
          {vendor.payments && vendor.payments.length > 0 ? (
            <div className="flex flex-col gap-2">
              {vendor.payments.map((pmt) => (
                <div
                  key={pmt.payment_id}
                  className="p-3.5 bg-white border border-[#E4DCC9] rounded-xl flex flex-col gap-1.5 shadow-sm"
                >
                  <div className="flex justify-between items-center text-xs font-mono text-[#18281F]">
                    <span className="font-bold">Txn: {pmt.transaction_id}</span>
                    <Badge variant={pmt.status === 'SUCCESS' ? 'success' : 'danger'}>
                      {pmt.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-[#6B7C70]">
                    <span>Amount: <strong className="text-[#10B981] font-bold">{formatCurrency(pmt.amount)}</strong></span>
                    <span>Method: <strong className="text-[#18281F]">{pmt.payment_method}</strong></span>
                    <span>Paid: <strong className="text-[#18281F]">{formatDate(pmt.paid_at)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#6B7C70] bg-white border border-[#E4DCC9] rounded-xl">
              No historical payment logs.
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
