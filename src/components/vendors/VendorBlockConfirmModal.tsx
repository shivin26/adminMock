import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import type { Vendor } from '../../types/vendor.types';
import { ShieldAlert, CheckCircle2, MessageSquare } from 'lucide-react';

export interface VendorBlockConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    vendorId: string | number,
    targetStatus: 'active' | 'suspended',
    customMessage?: string
  ) => void;
  vendor?: Vendor | null;
  isLoading?: boolean;
}

export const VendorBlockConfirmModal: React.FC<VendorBlockConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  vendor,
  isLoading = false,
}) => {
  const [customMessage, setCustomMessage] = useState('');

  if (!vendor) return null;

  const isCurrentlyBlocked = vendor.status === 'suspended';
  const targetStatus: 'active' | 'suspended' = isCurrentlyBlocked ? 'active' : 'suspended';

  const handleConfirm = () => {
    onConfirm(vendor.id, targetStatus, customMessage);
    setCustomMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCurrentlyBlocked ? 'Unblock Vendor Account' : 'Block / Suspend Vendor Account'}
      subtitle={`Store: ${vendor.storeName}`}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3.5 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isCurrentlyBlocked
                ? 'bg-[#EEE5DA] text-[#211A19] border border-[#E7DFD5]'
                : 'bg-[#FFE4E6] text-[#E11D48]'
            }`}
          >
            {isCurrentlyBlocked ? <CheckCircle2 size={22} /> : <ShieldAlert size={22} />}
          </div>

          <p className="text-xs text-[#211A19] leading-relaxed">
            {isCurrentlyBlocked ? (
              <>
                Reactivating <strong className="text-[#211A19]">{vendor.storeName}</strong> will allow the vendor store to resume accepting orders across residential societies.
              </>
            ) : (
              <>
                Blocking <strong className="text-[#E11D48]">{vendor.storeName}</strong> will immediately suspend vendor operations and prevent resident orders.
              </>
            )}
          </p>
        </div>

        {/* Custom Notification Message to Vendor */}
        {!isCurrentlyBlocked && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#211A19] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-[#C8A878]" /> Custom Block Reason Message (Sent to Vendor)
            </label>
            <textarea
              className="w-full p-3 bg-[#FAF8F5] border border-[#E7DFD5] rounded-xl text-xs text-[#211A19] outline-none focus:border-[#C8A878] focus:bg-white resize-none"
              rows={3}
              placeholder="Specify custom suspension reason (e.g. Non-compliance with society delivery guidelines, pending fee verification...)"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
            <span className="text-[11px] text-[#78716C]">
              This official suspension message will be dispatched directly to {vendor.email}.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-3 w-full mt-2 pt-4 border-t border-[#E7DFD5]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isCurrentlyBlocked ? 'primary' : 'danger'}
            isLoading={isLoading}
            onClick={handleConfirm}
          >
            {isCurrentlyBlocked ? 'Unblock & Reactivate' : 'Confirm Block Vendor'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
