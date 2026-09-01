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
  const { isSuperAdmin, userPowers } = usePermission();
  const [selectedPowers, setSelectedPowers] = useState<PowerSection[]>([]);
  const [allowedDelegationPowers, setAllowedDelegationPowers] = useState<PowerSection[]>([
    'SOCIETIES',
    'VENDORS',
  ]);

  useEffect(() => {
    if (subAdmin) {
      setSelectedPowers(subAdmin.powers);
      setAllowedDelegationPowers(subAdmin.allowedDelegationPowers || subAdmin.powers.filter((p) => p !== 'SUB_ADMINS'));
    }
  }, [subAdmin]);

  if (!subAdmin) return null;

  const handleConfirm = () => {
    const sanitized = isSuperAdmin
      ? selectedPowers
      : selectedPowers.filter((p) => p !== 'SUB_ADMINS' && userPowers.includes(p));

    if (isSuperAdmin && selectedPowers.includes('SUB_ADMINS')) {
      (onConfirm as any)(subAdmin.id, sanitized, allowedDelegationPowers);
    } else {
      onConfirm(subAdmin.id, sanitized);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Sub-Admin Power Permissions"
      subtitle={`User: ${subAdmin.name} (${subAdmin.email})`}
      size="lg"
    >
      <div className="flex flex-col gap-5 font-sans">
        <PowerSectionCheckboxGrid
          selectedPowers={selectedPowers}
          onChange={setSelectedPowers}
        />

        {/* Super Admin Delegation Power Configuration for Sub-Admin Managers */}
        {isSuperAdmin && selectedPowers.includes('SUB_ADMINS') && (
          <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex flex-col gap-3 font-sans shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-amber-700" /> Delegation Powers Permitted for this Sub-Admin
              </span>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded border border-amber-300 font-mono">
                SUPER ADMIN RULE
              </span>
            </div>
            <p className="text-xs text-[#211A19]">
              Configure which power sections this Sub-Admin manager can delegate when creating child sub-admins:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['SOCIETIES', 'VENDORS', 'SUBSCRIPTIONS', 'SUPPORT', 'SETTINGS'].map((powerId) => {
                const isChecked = allowedDelegationPowers.includes(powerId as PowerSection);
                const labelMap: Record<string, string> = {
                  SOCIETIES: 'Societies & Area Management',
                  VENDORS: 'User & Vendor',
                  SUBSCRIPTIONS: 'Subscriptions & Financials',
                  SUPPORT: 'Support Desk',
                  SETTINGS: 'Platform Settings',
                };

                return (
                  <label
                    key={powerId}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                      isChecked ? 'bg-white border-amber-400 text-amber-950 font-bold' : 'bg-[#FAF8F5] border-[#E7DFD5] text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllowedDelegationPowers([...allowedDelegationPowers, powerId as PowerSection]);
                        } else {
                          setAllowedDelegationPowers(allowedDelegationPowers.filter((p) => p !== powerId));
                        }
                      }}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    {labelMap[powerId] || powerId}
                  </label>
                );
              })}
            </div>
          </div>
        )}

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
