import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { Input } from '../common/Input/Input';
import type { Vendor } from '../../types/vendor.types';
import { XCircle } from 'lucide-react';

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
  const [reason, setReason] = useState('');

  if (!vendor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReject(vendor.id, reason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Vendor Application"
      subtitle={`Store: ${vendor.storeName}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-slate-300">
          Are you sure you want to reject the onboarding application for{' '}
          <strong className="text-white">{vendor.storeName}</strong>?
        </p>

        <Input
          label="Rejection Reason (Optional)"
          placeholder="e.g. Invalid GSTIN or payment receipt missing"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            leftIcon={<XCircle size={16} />}
            isLoading={isLoading}
          >
            Confirm Rejection
          </Button>
        </div>
      </form>
    </Modal>
  );
};
