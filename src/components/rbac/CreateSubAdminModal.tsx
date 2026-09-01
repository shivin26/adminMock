import React, { useState } from 'react';
import { Modal } from '../common/Modal/Modal';
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
  const { isSuperAdmin } = usePermission();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPowers, setSelectedPowers] = useState<PowerSection[]>([
    'SOCIETIES',
    'VENDORS',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    // Sub-admins can never delegate SUB_ADMINS power section
    const sanitizedPowers = isSuperAdmin
      ? selectedPowers
      : selectedPowers.filter((p) => p !== 'SUB_ADMINS');

    const creatorName = isSuperAdmin
      ? 'Super Admin'
      : `Sub-Admin ${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Sub-Admin Staff';

    onSubmit({
      name,
      email,
      password,
      powers: sanitizedPowers,
      createdBy: creatorName,
      createdRole: isSuperAdmin ? 'super_admin' : 'sub_admin',
    });
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sub-Admin Account"
      subtitle="Delegate specific power sections to a company team member."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <Button type="button" variant="secondary" onClick={onClose}>
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
    </Modal>
  );
};
