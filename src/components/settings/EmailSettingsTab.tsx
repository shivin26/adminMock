import React from 'react';
import { Mail, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { FormSelect } from '../form/FormSelect';
import { Button } from '../ui/Button';
import { emailSettingsSchema, EmailSettingsSchemaType } from '../../schemas/settings.schema';
import { EmailSettings } from '../../types/settings';
import { useUpdateEmailSettings, useSendTestEmail } from '../../hooks/useSettings';

export interface EmailSettingsTabProps {
  data?: EmailSettings;
}

export const EmailSettingsTab: React.FC<EmailSettingsTabProps> = ({ data }) => {
  const updateMutation = useUpdateEmailSettings();
  const testEmailMutation = useSendTestEmail();

  const defaultValues: Partial<EmailSettingsSchemaType> = {
    smtpHost: data?.smtpHost || '',
    smtpPort: data?.smtpPort || 587,
    smtpUser: data?.smtpUser || '',
    senderEmail: data?.senderEmail || '',
    senderName: data?.senderName || '',
    encryptionMode: data?.encryptionMode || 'tls',
  };

  const handleSubmit = async (values: EmailSettingsSchemaType) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[var(--gold)]" />
              <CardTitle className="text-xl">Email & SMTP Configuration</CardTitle>
            </div>
            <CardDescription>TRANSACTIONAL EMAIL SERVER AND DISPATCH PARAMETERS</CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Send className="h-3.5 w-3.5" />}
            isLoading={testEmailMutation.isPending}
            onClick={() => testEmailMutation.mutate()}
          >
            Send Test Email
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form
          schema={emailSettingsSchema}
          onSubmit={handleSubmit}
          options={{ defaultValues }}
          key={data?.smtpHost || 'email'}
        >
          {() => (
            <div className="space-y-4 pt-2 font-body">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput name="smtpHost" label="SMTP Server Host" placeholder="smtp.sendgrid.net" required />
                <FormInput name="smtpPort" label="SMTP Port" type="number" placeholder="587" required />
                <FormSelect
                  name="encryptionMode"
                  label="Encryption Protocol"
                  required
                  options={[
                    { label: 'TLS (Recommended)', value: 'tls' },
                    { label: 'SSL', value: 'ssl' },
                    { label: 'None', value: 'none' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--border)] pt-4">
                <FormInput name="smtpUser" label="SMTP Username / API Key" placeholder="apikey_digilocal" required />
                <FormInput name="senderEmail" label="Sender Email Address" type="email" placeholder="noreply@digilocal.com" required />
                <FormInput name="senderName" label="Sender Display Name" placeholder="DigiLocal Platform" required />
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border)] mt-4">
                <Button type="submit" variant="default" isLoading={updateMutation.isPending}>
                  Save SMTP Settings
                </Button>
              </div>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
};
