import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal/Modal';
import { Button } from '../common/Button/Button';
import { PowerSectionCheckboxGrid } from './PowerSectionCheckboxGrid';
import type { SubAdminUser, PowerSection } from '../../types/rbac.types';
import { ShieldCheck } from 'lucide-react';

import { usePermission } from '../../hooks/usePermission';

export interface EditSubAdminPowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subAdminId: string, powers: PowerSection[]) => void;
  subAdmin?: SubAdminUser | null;
  isLoading?: boolean;
}

export const EditSubAdminPowersModal: React.FC<EditSubAdminPowersModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subAdmin,
  isLoading = false,
}) => {
  const { isSuperAdmin } = usePermission();
  const [selectedPowers, setSelectedPowers] = useState<PowerSection[]>([]);

  useEffect(() => {
    if (subAdmin) {
      setSelectedPowers(subAdmin.powers);
    }
  }, [subAdmin]);

  if (!subAdmin) return null;

  const handleConfirm = () => {
    const sanitized = isSuperAdmin
      ? selectedPowers
      : selectedPowers.filter((p) => p !== 'SUB_ADMINS');
    onConfirm(subAdmin.id, sanitized);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Sub-Admin Power Permissions"
      subtitle={`User: ${subAdmin.name} (${subAdmin.email})`}
      size="lg"
    >
      <div className="flex flex-col gap-5">
        <PowerSectionCheckboxGrid
          selectedPowers={selectedPowers}
          onChange={setSelectedPowers}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<ShieldCheck size={16} />}
            isLoading={isLoading}
            onClick={handleConfirm}
          >
            Update Power Permissions
          </Button>
        </div>
      </div>
    </Modal>
  );
};
