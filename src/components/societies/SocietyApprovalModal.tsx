import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import type { Society } from '../../types/society.types';
import { CheckCircle2, Building2, MessageSquare } from 'lucide-react';

export interface SocietyApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmApprove: (societyId: string | number, welcomeNote?: string) => void;
  society?: Society | null;
  isLoading?: boolean;
}

export const SocietyApprovalModal: React.FC<SocietyApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirmApprove,
  society,
  isLoading = false,
}) => {
  const [welcomeNote, setWelcomeNote] = useState('');

  if (!society) return null;

  const handleApprove = () => {
    onConfirmApprove(society.id, welcomeNote);
    setWelcomeNote('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Society First-Time Registration"
      subtitle={`Society: ${society.name} (Code: ${society.code})`}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Info Banner */}
        <div className="p-4 bg-[#EFE8D8] border border-[#E4DCC9] rounded-xl flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#18281F] text-[#E6C35C] flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#18281F]">First-Time Registration Onboarding</h4>
            <p className="text-xs text-[#18281F] mt-1 leading-relaxed">
              Approving <strong className="text-[#18281F]">{society.name}</strong> will activate the residential enclave code <strong className="text-[#18281F]">{society.code}</strong> and allow local vendors to service residents.
            </p>
          </div>
        </div>

        {/* Location & Code Details */}
        <div className="p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl flex justify-between items-center text-xs">
          <div>
            <span className="text-[#6B7C70] block">Enclave Address:</span>
            <span className="font-bold text-[#18281F]">{society.address}</span>
          </div>
          <div className="text-right">
            <span className="text-[#6B7C70] block">City & Postal:</span>
            <span className="font-bold text-[#18281F]">{society.city}, {society.postalCode}</span>
          </div>
        </div>

        {/* Optional Welcome Onboarding Note */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare size={14} className="text-[#C4A066]" /> Onboarding Note / Instructions (Optional)
          </label>
          <textarea
            className="w-full p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs text-[#18281F] outline-none focus:border-[#C4A066] focus:bg-white resize-none"
            rows={3}
            placeholder="Include welcome notes or administrative guidelines for the society board..."
            value={welcomeNote}
            onChange={(e) => setWelcomeNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 w-full mt-2 pt-4 border-t border-[#E4DCC9]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<CheckCircle2 size={16} />}
            isLoading={isLoading}
            onClick={handleApprove}
          >
            Approve & Activate Society
          </Button>
        </div>
      </div>
    </Modal>
  );
};
