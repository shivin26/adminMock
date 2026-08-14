import React from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import type { SubAdminUser } from '../../types/rbac.types';
import { AlertTriangle } from 'lucide-react';

export interface RevokeSubAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subAdminId: string) => void;
  subAdmin?: SubAdminUser | null;
  isLoading?: boolean;
}

export const RevokeSubAdminModal: React.FC<RevokeSubAdminModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subAdmin,
  isLoading = false,
}) => {
  if (!subAdmin) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revoke Sub-Admin Account Access"
      subtitle={`User: ${subAdmin.name} (${subAdmin.email})`}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Warning Banner */}
        <div className="p-4 bg-[#FFE4E6] border border-rose-300/60 rounded-xl flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 text-[#E11D48] flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#E11D48]">Administrative Warning</h4>
            <p className="text-xs text-[#18281F] mt-1 leading-relaxed">
              Revoking access for <strong className="text-[#18281F]">{subAdmin.name}</strong> will immediately terminate their sub-admin account, revoke all delegated power section permissions ({subAdmin.powers.join(', ')}), and log them out of the Super Admin Panel.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 w-full mt-2 pt-4 border-t border-[#E4DCC9]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={isLoading}
            onClick={() => onConfirm(subAdmin.id)}
          >
            Confirm Revoke Sub-Admin Access
          </Button>
        </div>
      </div>
    </Modal>
  );
};
