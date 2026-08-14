import React from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import type { Society } from '../../types/society.types';
import { AlertTriangle } from 'lucide-react';

export interface SocietyDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  society?: Society | null;
  isLoading?: boolean;
}

export const SocietyDeleteConfirmModal: React.FC<SocietyDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  society,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Society Record"
      size="sm"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <p className="text-sm text-slate-300">
          Are you sure you want to delete <strong className="text-white">{society?.name}</strong>?
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 w-full mt-4 pt-4 border-t border-slate-700/50">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={isLoading} onClick={onConfirm}>
            Delete Society
          </Button>
        </div>
      </div>
    </Modal>
  );
};
