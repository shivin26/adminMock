import React from 'react';
import { UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { Button } from '../ui/Button';
import { adminProfileSchema, AdminProfileSchemaType } from '../../schemas/settings.schema';
import { AdminProfileSettings } from '../../types/settings';
import { useUpdateAdminProfile } from '../../hooks/useSettings';

export interface AdminProfileTabProps {
  data?: AdminProfileSettings;
}

export const AdminProfileTab: React.FC<AdminProfileTabProps> = ({ data }) => {
  const updateMutation = useUpdateAdminProfile();

  const defaultValues: Partial<AdminProfileSchemaType> = {
    fullName: data?.fullName || '',
    email: data?.email || '',
    phone: data?.phone || '',
    designation: data?.designation || '',
    avatarUrl: data?.avatarUrl || '',
  };

  const handleSubmit = async (values: AdminProfileSchemaType) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-[var(--gold)]" />
          <CardTitle className="text-xl">Admin Profile & Details</CardTitle>
        </div>
        <CardDescription>MANAGE YOUR PERSONAL IDENTITY, CONTACT, AND SYSTEM ROLE</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={adminProfileSchema}
          onSubmit={handleSubmit}
          options={{ defaultValues }}
          key={data?.email || 'profile'}
        >
          {() => (
            <div className="space-y-6 pt-2 font-body">
              <div className="flex items-center gap-5 pb-4 border-b border-[var(--border)]">
                <img
                  src={data?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'}
                  alt="Admin Avatar"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-[var(--gold)] shrink-0"
                />
                <div>
                  <h4 className="font-serif font-bold text-lg text-[var(--foreground)]">{data?.fullName}</h4>
                  <p className="font-mono text-xs text-[var(--muted-foreground)]">{data?.designation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput name="fullName" label="Full Name" placeholder="Alex Vance" required />
                <FormInput name="email" label="Email Address" type="email" placeholder="alex@digilocal.com" required />
                <FormInput name="phone" label="Phone Number" placeholder="+1 (555) 901-2345" required />
                <FormInput name="designation" label="System Role / Designation" placeholder="Senior System Architect" required />
              </div>

              <FormInput
                name="avatarUrl"
                label="Avatar Image URL (Optional)"
                placeholder="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
              />

              <div className="flex justify-end pt-4 border-t border-[var(--border)]">
                <Button type="submit" variant="default" isLoading={updateMutation.isPending}>
                  Save Profile Changes
                </Button>
              </div>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
};
