import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import type { Society } from '../../types/society.types';
import { ShieldAlert, CheckCircle2, MessageSquare } from 'lucide-react';

export interface SocietyBlockConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    societyId: string | number,
    targetStatus: 'active' | 'suspended',
    customMessage?: string
  ) => void;
  society?: Society | null;
  isLoading?: boolean;
}

export const SocietyBlockConfirmModal: React.FC<SocietyBlockConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  society,
  isLoading = false,
}) => {
  const [customMessage, setCustomMessage] = useState('');

  if (!society) return null;

  const isCurrentlyBlocked = society.status === 'suspended';
  const targetStatus: 'active' | 'suspended' = isCurrentlyBlocked ? 'active' : 'suspended';

  const handleConfirm = () => {
    onConfirm(society.id, targetStatus, customMessage);
    setCustomMessage('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCurrentlyBlocked ? 'Unblock Society Enclave' : 'Block Society Enclave'}
      subtitle={`Society: ${society.name} (Code: ${society.code})`}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3.5 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isCurrentlyBlocked
                ? 'bg-[#EFE8D8] text-[#18281F] border border-[#E4DCC9]'
                : 'bg-[#FFE4E6] text-[#E11D48]'
            }`}
          >
            {isCurrentlyBlocked ? <CheckCircle2 size={22} /> : <ShieldAlert size={22} />}
          </div>

          <p className="text-xs text-[#18281F] leading-relaxed">
            {isCurrentlyBlocked ? (
              <>
                Unblocking <strong className="text-[#18281F]">{society.name}</strong> will reactivate society enclave operations and allow local vendor services.
              </>
            ) : (
              <>
                Blocking <strong className="text-[#E11D48]">{society.name}</strong> will suspend all vendor activities servicing this residential society.
              </>
            )}
          </p>
        </div>

        {/* Custom Block Message to Society Management */}
        {!isCurrentlyBlocked && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#18281F] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-[#C4A066]" /> Custom Block Reason Message (Sent to Society)
            </label>
            <textarea
              className="w-full p-3 bg-[#FAF9F6] border border-[#E4DCC9] rounded-xl text-xs text-[#18281F] outline-none focus:border-[#C4A066] focus:bg-white resize-none"
              rows={3}
              placeholder="Specify custom suspension reason (e.g. Administrative security update, society board audit, verification pending...)"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
            <span className="text-[11px] text-[#6B7C70]">
              This official notification will be sent to the society administrator.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-3 w-full mt-2 pt-4 border-t border-[#E4DCC9]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isCurrentlyBlocked ? 'primary' : 'danger'}
            isLoading={isLoading}
            onClick={handleConfirm}
          >
            {isCurrentlyBlocked ? 'Unblock Society' : 'Confirm Block Society'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
