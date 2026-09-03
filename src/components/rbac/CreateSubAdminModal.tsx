import React, { useState } from 'react';
import { Drawer } from '../common/Drawer/Drawer';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import { PowerSectionCheckboxGrid } from './PowerSectionCheckboxGrid';
import type { CreateSubAdminRequest, PowerSection } from '../../types/rbac.types';
import { User, Mail, Key, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';

export interface CreateSubAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSubAdminRequest) => void;
  isLoading?: boolean;
}

export const CreateSubAdminModal: React.FC<CreateSubAdminModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const { isSuperAdmin, userPowers } = usePermission();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPowers, setSelectedPowers] = useState<PowerSection[]>([]);
  const [allowedDelegationPowers, setAllowedDelegationPowers] = useState<PowerSection[]>([
    'SOCIETIES',
    'VENDORS',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    // Sub-admins can only delegate powers they themselves possess (excluding SUB_ADMINS)
    const sanitizedPowers = isSuperAdmin
      ? selectedPowers
      : selectedPowers.filter((p) => p !== 'SUB_ADMINS' && userPowers.includes(p));

    const creatorName = isSuperAdmin
      ? 'Super Admin'
      : `Sub-Admin ${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Sub-Admin Staff';

    onSubmit({
      name,
      email,
      password,
      powers: sanitizedPowers,
      allowedDelegationPowers: isSuperAdmin && selectedPowers.includes('SUB_ADMINS') ? allowedDelegationPowers : undefined,
      createdBy: creatorName,
      creatorId: isSuperAdmin ? 'super-admin' : (user?.id || 'sub-aarushi'),
      createdRole: isSuperAdmin ? 'super_admin' : 'sub_admin',
    });
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sub-Admin Account"
      subtitle="Delegate specific power sections to a company team member."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 text-xs font-sans">
        <Input
          label="Sub-Admin Full Name"
          placeholder="e.g. Vikram Mehta"
          leftIcon={<User size={16} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Sub-Admin Corporate Email"
          type="email"
          placeholder="vikram.admin@digilocal.com"
          leftIcon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Assign Sub-Admin Password"
          type="password"
          placeholder="Set password for sub-admin login"
          leftIcon={<Key size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

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
              Select which specific power sections this Sub-Admin manager is allowed to grant when creating child sub-admins:
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

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E7DFD5] mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<ShieldCheck size={16} />}
            isLoading={isLoading}
            disabled={selectedPowers.length === 0}
          >
            Create Sub-Admin Account
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
