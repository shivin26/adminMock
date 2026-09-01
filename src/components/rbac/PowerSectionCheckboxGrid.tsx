import React from 'react';
import { POWER_SECTIONS_LIST, type PowerSection } from '../../types/rbac.types';
import { Building2, Users, CreditCard, Settings, ShieldAlert, Check } from 'lucide-react';
import './PowerSectionCheckboxGrid.css';

const ICON_MAP: Record<string, React.ReactNode> = {
  Building2: <Building2 size={20} />,
  Users: <Users size={20} />,
  CreditCard: <CreditCard size={20} />,
  Settings: <Settings size={20} />,
  ShieldAlert: <ShieldAlert size={20} />,
};

import { usePermission } from '../../hooks/usePermission';
import { Lock } from 'lucide-react';

export interface PowerSectionCheckboxGridProps {
  selectedPowers: PowerSection[];
  onChange: (powers: PowerSection[]) => void;
}

export const PowerSectionCheckboxGrid: React.FC<PowerSectionCheckboxGridProps> = ({
  selectedPowers,
  onChange,
}) => {
  const { isSuperAdmin, userPowers } = usePermission();

  const togglePower = (powerId: PowerSection) => {
    // Sub-admins cannot grant SUB_ADMINS power section or any power they do not possess
    if (!isSuperAdmin) {
      if (powerId === 'SUB_ADMINS') return;
      if (!userPowers.includes(powerId)) return;
    }

    if (selectedPowers.includes(powerId)) {
      onChange(selectedPowers.filter((p) => p !== powerId));
    } else {
      onChange([...selectedPowers, powerId]);
    }
  };

  return (
    <div className="power-grid-container font-sans">
      <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-2 font-mono">
        Select Delegated Power Sections {!isSuperAdmin && '(Delegation Power Ceiling Active)'}
      </label>

      <div className="power-grid">
        {POWER_SECTIONS_LIST.map((item) => {
          const isSelected = selectedPowers.includes(item.id);
          const isSubAdminPower = item.id === 'SUB_ADMINS';
          const isOwnedByAdmin = isSuperAdmin || userPowers.includes(item.id);

          const isDisabled = !isSuperAdmin && (isSubAdminPower || !isOwnedByAdmin);

          let disabledReason = '';
          if (isDisabled) {
            if (isSubAdminPower) {
              disabledReason = 'SUPER ADMIN ONLY';
            } else if (!isOwnedByAdmin) {
              disabledReason = 'NOT IN YOUR POWERS';
            }
          }

          return (
            <div
              key={item.id}
              className={`power-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
              onClick={() => togglePower(item.id)}
            >
              <div className="power-card-header">
                <div className="power-icon-wrapper">{ICON_MAP[item.iconName]}</div>
                {isDisabled ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono flex items-center gap-1">
                    <Lock size={10} /> {disabledReason}
                  </span>
                ) : (
                  <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <Check size={12} />}
                  </div>
                )}
              </div>
              <h4 className="power-card-title flex items-center justify-between">
                {item.label}
              </h4>
              <p className="power-card-desc">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
