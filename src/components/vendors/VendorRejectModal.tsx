import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import { Badge } from '../common/Badge/Badge';
import type { Vendor } from '../../types/vendor.types';
import { XCircle, AlertCircle, FileText } from 'lucide-react';

export interface VendorRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (vendorId: string | number, reason?: string) => void;
  vendor?: Vendor | null;
  isLoading?: boolean;
}

export const VendorRejectModal: React.FC<VendorRejectModalProps> = ({
  isOpen,
  onClose,
  onConfirmReject,
  vendor,
  isLoading = false,
}) => {
  const [reason, setReason] = useState(
    vendor?.status === 'on_hold'
      ? 'Required documents/information were not provided after hold notification.'
      : 'Incomplete business registration credentials or unverified GSTIN.'
  );

  if (!vendor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReject(vendor.id, reason.trim());
  };

  const presetReasons = [
    'Required documents/information were not supplied after holding notification.',
    'Invalid GSTIN or unverified FSSAI license credentials.',
    'Store location or registered address could not be verified.',
    'Duplicate vendor registration or fraudulent details detected.',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Vendor Application"
      subtitle={`Store: ${vendor.storeName} (${vendor.ownerName})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-900">
          <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Confirm Application Rejection</p>
            <p>
              Are you sure you want to reject the onboarding application for <strong className="text-red-950">{vendor.storeName}</strong>? This action will mark the registration as <strong>Rejected</strong>.
            </p>
          </div>
        </div>

        {/* Current Hold Context if rejecting from On Hold tab */}
        {vendor.status === 'on_hold' && vendor.holdReason && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <span className="font-bold block mb-0.5 text-amber-950">Previous Hold Reason:</span>
            <p className="italic font-serif text-[#18281F]">"{vendor.holdReason}"</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#18281F] uppercase tracking-wider mb-1">
            Rejection Reason (Logged & Dispatched)
          </label>
          <textarea
            required
            rows={3}
            className="w-full p-3 text-xs bg-white border border-[#E4DCC9] rounded-xl text-[#18281F] focus:outline-none focus:border-[#C4A066]"
            placeholder="Specify reason for rejecting this vendor application..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Preset Reasons */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-[#6B7C70] uppercase tracking-wider flex items-center gap-1">
            <FileText size={12} /> Common Rejection Reasons:
          </span>
          {presetReasons.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setReason(preset)}
              className="text-left text-xs p-2 bg-[#F8F5EE] hover:bg-[#EFE8D8] border border-[#E4DCC9] rounded-lg text-[#18281F] transition-all"
            >
              • {preset}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-[#E4DCC9]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            leftIcon={<XCircle size={16} />}
            isLoading={isLoading}
          >
            Confirm Application Rejection
          </Button>
        </div>
      </form>
    </Modal>
  );
};
