import React from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import type { Subscription } from '../../types/subscription.types';
import { formatCurrency, formatDate } from '../../utils/formatters.utils';
import { Download, CheckCircle2, FileText } from 'lucide-react';

export interface SubscriptionInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (id: string | number) => void;
  subscription?: Subscription | null;
  isLoading?: boolean;
}

export const SubscriptionInvoiceModal: React.FC<SubscriptionInvoiceModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  subscription,
  isLoading = false,
}) => {
  if (!subscription) return null;

  const basePrice = subscription.price;
  const gstAmount = Number((basePrice * 0.18).toFixed(2));
  const totalAmount = basePrice + gstAmount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GST Tax Invoice Preview"
      subtitle={`Invoice ID: INV-2026-${subscription.id}`}
      size="md"
    >
      <div className="flex flex-col gap-5">
        {/* Invoice Header Card */}
        <div className="p-4 bg-[#FAF9F6] border border-[#E4DCC9] rounded-2xl flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18281F] text-[#E6C35C] flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#C4A066] uppercase tracking-wider block">
                DigiLocal Enterprise Invoice
              </span>
              <h4 className="text-base font-bold text-[#18281F] font-serif mt-0.5">{subscription.storeName}</h4>
              <p className="text-xs text-[#6B7C70]">Society Enclave: {subscription.societyName}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#6B7C70]">Issued On:</span>
            <span className="text-xs font-bold text-[#18281F] block">
              {formatDate(subscription.startDate)}
            </span>
          </div>
        </div>

        {/* GST Invoice Details Table */}
        <div className="border border-[#E4DCC9] rounded-2xl overflow-hidden shadow-sm bg-white">
          <div className="p-3 bg-[#FAF9F6] text-xs font-bold text-[#18281F] flex justify-between uppercase border-b border-[#E4DCC9]">
            <span>Item Description</span>
            <span>Amount</span>
          </div>
          <div className="p-3.5 text-xs flex justify-between text-[#18281F] border-b border-[#E4DCC9]/60 font-semibold">
            <span>
              DigiLocal Vendor Platform Fee ({subscription.tier.toUpperCase()} Tier)
            </span>
            <span>{formatCurrency(basePrice)}</span>
          </div>
          <div className="p-3.5 text-xs flex justify-between text-[#6B7C70] border-b border-[#E4DCC9]/60">
            <span>CGST + SGST Tax (18%)</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>
          <div className="p-3.5 text-sm flex justify-between font-extrabold text-[#18281F] bg-[#EFE8D8]">
            <span>Total Payable Amount</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#18281F] bg-[#FAF9F6] border border-[#E4DCC9] p-3 rounded-xl">
          <CheckCircle2 size={16} className="text-[#18281F] shrink-0" />
          <span>Payment Verified & Cleared via Razorpay Payment Gateway.</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E4DCC9]">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            leftIcon={<Download size={16} />}
            isLoading={isLoading}
            onClick={() => onDownload(subscription.id)}
          >
            Download PDF Invoice
          </Button>
        </div>
      </div>
    </Modal>
  );
};
