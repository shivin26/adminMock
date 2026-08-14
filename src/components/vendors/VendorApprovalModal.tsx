import React from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import type { Vendor } from '../../types/vendor.types';
import { formatCurrency, formatDate } from '../../utils/formatters.utils';
import { CreditCard, Store, CheckCircle2 } from 'lucide-react';

export interface VendorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove: (vendorId: string | number) => void;
  vendor?: Vendor | null;
  isLoading?: boolean;
}

export const VendorApprovalModal: React.FC<VendorApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirmApprove,
  vendor,
  isLoading = false,
}) => {
  if (!vendor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Vendor Application"
      subtitle={`Store: ${vendor.storeName} (${vendor.ownerName})`}
      size="lg"
    >
      <div className="flex flex-col gap-5">
        {/* Vendor Summary Card */}
        <div className="flex items-center gap-4 p-4 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl">
          <img
            src={vendor.avatarUrl}
            alt={vendor.storeName}
            className="w-14 h-14 rounded-xl object-cover border border-[#E4DCC9]"
          />
          <div className="flex-1">
            <h4 className="text-base font-bold text-[#18281F] font-serif">{vendor.storeName}</h4>
            <p className="text-xs text-[#6B7C70] mt-0.5">
              Email: <strong className="text-[#18281F]">{vendor.email}</strong> • Phone: <strong className="text-[#18281F]">{vendor.phone}</strong>
            </p>
            <p className="text-xs text-[#6B7C70] mt-0.5">
              Society: <strong className="text-[#18281F]">{vendor.societyName}</strong> • GSTIN: <strong className="text-[#18281F]">{vendor.gstin}</strong>
            </p>
          </div>
          <Badge variant="warning">PENDING</Badge>
        </div>

        {/* Subscription Summary Card */}
        <div className="p-4 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl flex flex-col gap-2.5">
          <h5 className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
            <Store size={15} className="text-[#C4A066]" /> Subscription Summary
          </h5>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B7C70]">Subscription Status:</span>
            <Badge variant="success">SUBSCRIBED</Badge>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B7C70]">Renewal Date:</span>
            <span className="text-[#18281F] font-bold">{formatDate(vendor.subscriptionRenewalDate)}</span>
          </div>
        </div>

        {/* Payment History Verification Card */}
        <div className="flex flex-col gap-2.5">
          <h5 className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={15} className="text-[#C4A066]" /> Payment Transaction Verification
          </h5>
          {vendor.payments && vendor.payments.length > 0 ? (
            vendor.payments.map((pmt) => (
              <div
                key={pmt.payment_id}
                className="p-3.5 bg-[#EFE8D8] border border-[#E4DCC9] rounded-xl flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-xs font-mono font-bold text-[#18281F]">
                  <span>Txn ID: {pmt.transaction_id}</span>
                  <Badge variant={pmt.status === 'SUCCESS' ? 'success' : 'danger'}>
                    {pmt.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-[#6B7C70]">
                  <span>Amount: <strong className="text-[#18281F] font-bold">{formatCurrency(pmt.amount)}</strong></span>
                  <span>Method: <strong className="text-[#18281F] font-bold">{pmt.payment_method}</strong></span>
                  <span>Paid: <strong className="text-[#18281F] font-bold">{formatDate(pmt.paid_at)}</strong></span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-[#6B7C70] bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl">
              No transaction receipts attached.
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-[#E4DCC9]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<CheckCircle2 size={16} />}
            isLoading={isLoading}
            onClick={() => onConfirmApprove(vendor.id)}
          >
            Approve Vendor Application
          </Button>
        </div>
      </div>
    </Modal>
  );
};
