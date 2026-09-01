import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../../utils/validation.schemas';
import { ShieldAlert, Lock, Key } from 'lucide-react';

export interface PasswordSettingsCardProps {
  onSubmit: (values: ChangePasswordFormValues) => void;
  isLoading?: boolean;
}

export const PasswordSettingsCard: React.FC<PasswordSettingsCardProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleFormSubmit = (values: ChangePasswordFormValues) => {
    onSubmit(values);
    reset();
  };

  return (
    <div className="p-6 bg-white border border-[#E7DFD5] rounded-2xl shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#E7DFD5]">
        <div className="w-10 h-10 rounded-xl bg-[#211A19] text-[#A88B58] flex items-center justify-center shrink-0">
          <ShieldAlert size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#211A19] font-serif">Administrator Security</h3>
          <p className="text-xs text-[#78716C]">Update root administrator secret / password credentials.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <Input
          label="Current Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="flex justify-end pt-2 border-t border-[#E7DFD5]">
          <Button type="submit" variant="primary" leftIcon={<Key size={16} />} isLoading={isLoading}>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};
