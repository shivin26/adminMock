import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { Button } from '../ui/Button';
import { changePasswordSchema, ChangePasswordSchemaType } from '../../schemas/settings.schema';
import { useChangeAdminPassword } from '../../hooks/useSettings';

export const SecurityTab: React.FC = () => {
  const changePasswordMutation = useChangeAdminPassword();

  const handleSubmit = async (values: ChangePasswordSchemaType) => {
    await changePasswordMutation.mutateAsync(values);
  };

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[var(--gold)]" />
          <CardTitle className="text-xl">Security & Change Password</CardTitle>
        </div>
        <CardDescription>UPDATE YOUR SYSTEM ACCESS CREDENTIALS AND AUTHENTICATION</CardDescription>
      </CardHeader>
      <CardContent>
        <Form schema={changePasswordSchema} onSubmit={handleSubmit}>
          {() => (
            <div className="space-y-4 pt-2 font-body max-w-xl">
              <FormInput
                name="currentPassword"
                label="Current Password"
                type="password"
                placeholder="••••••••"
                required
              />

              <FormInput
                name="newPassword"
                label="New Password"
                type="password"
                placeholder="••••••••"
                required
                description="Minimum 8 characters with letters, numbers, or symbols"
              />

              <FormInput
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                required
              />

              <div className="flex justify-end pt-4 border-t border-[var(--border)] mt-4">
                <Button type="submit" variant="default" isLoading={changePasswordMutation.isPending}>
                  Update Password
                </Button>
              </div>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
};
