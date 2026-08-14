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

export interface PowerSectionCheckboxGridProps {
  selectedPowers: PowerSection[];
  onChange: (powers: PowerSection[]) => void;
}

export const PowerSectionCheckboxGrid: React.FC<PowerSectionCheckboxGridProps> = ({
  selectedPowers,
  onChange,
}) => {
  const togglePower = (powerId: PowerSection) => {
    if (selectedPowers.includes(powerId)) {
      onChange(selectedPowers.filter((p) => p !== powerId));
    } else {
      onChange([...selectedPowers, powerId]);
    }
  };

  return (
    <div className="power-grid-container">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
        Select Delegated Power Sections
      </label>

      <div className="power-grid">
        {POWER_SECTIONS_LIST.map((item) => {
          const isSelected = selectedPowers.includes(item.id);
          return (
            <div
              key={item.id}
              className={`power-card ${isSelected ? 'selected' : ''}`}
              onClick={() => togglePower(item.id)}
            >
              <div className="power-card-header">
                <div className="power-icon-wrapper">{ICON_MAP[item.iconName]}</div>
                <div className={`checkbox-indicator ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <Check size={12} />}
                </div>
              </div>
              <h4 className="power-card-title">{item.label}</h4>
              <p className="power-card-desc">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
