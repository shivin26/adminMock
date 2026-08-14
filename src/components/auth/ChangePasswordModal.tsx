import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { Button } from '../ui/Button';
import { changePasswordSchema, ChangePasswordSchemaType } from '../../schemas/auth.schema';
import { useChangePassword } from '../../hooks/auth/useAuthMutations';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (values: ChangePasswordSchemaType) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[var(--gold)]" />
          <span>Change Account Password</span>
        </div>
      }
      description="Update your security credentials. Your new password must meet complexity requirements."
    >
      <Form schema={changePasswordSchema} onSubmit={handleSubmit}>
        {() => (
          <div className="space-y-4 pt-2">
            <FormInput
              name="currentPassword"
              label="Current Password"
              placeholder="••••••••"
              type="password"
              required
              leftIcon={<Lock className="h-4 w-4 text-[var(--muted-foreground)]" />}
            />

            <FormInput
              name="newPassword"
              label="New Password"
              placeholder="••••••••"
              type="password"
              required
              description="At least 8 chars, 1 uppercase, 1 number, 1 special character"
              leftIcon={<Lock className="h-4 w-4 text-[var(--muted-foreground)]" />}
            />

            <FormInput
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="••••••••"
              type="password"
              required
              leftIcon={<Lock className="h-4 w-4 text-[var(--muted-foreground)]" />}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)] mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                isLoading={changePasswordMutation.isPending}
              >
                Update Password
              </Button>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};
