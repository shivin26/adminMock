import React from 'react';
import { Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Form } from '../form/Form';
import { FormCheckbox } from '../form/FormCheckbox';
import { Button } from '../ui/Button';
import { notificationPreferencesSchema, NotificationPreferencesSchemaType } from '../../schemas/settings.schema';
import { NotificationPreferences } from '../../types/settings';
import { useUpdateNotificationPreferences } from '../../hooks/useSettings';

export interface NotificationPreferencesTabProps {
  data?: NotificationPreferences;
}

export const NotificationPreferencesTab: React.FC<NotificationPreferencesTabProps> = ({ data }) => {
  const updateMutation = useUpdateNotificationPreferences();

  const defaultValues: Partial<NotificationPreferencesSchemaType> = {
    emailAlerts: data?.emailAlerts ?? true,
    smsAlerts: data?.smsAlerts ?? false,
    pushAlerts: data?.pushAlerts ?? true,
    securityAlerts: data?.securityAlerts ?? true,
  };

  const handleSubmit = async (values: NotificationPreferencesSchemaType) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[var(--gold)]" />
          <CardTitle className="text-xl">Notification Preferences</CardTitle>
        </div>
        <CardDescription>CONFIGURE DISPATCH CHANNELS FOR SYSTEM AND TRANSACTION ALERTS</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={notificationPreferencesSchema}
          onSubmit={handleSubmit}
          options={{ defaultValues }}
          key={data?.emailAlerts ? 'notif_true' : 'notif_false'}
        >
          {() => (
            <div className="space-y-4 pt-2 font-body">
              <FormCheckbox
                name="emailAlerts"
                label="Email Notifications"
                description="Receive order summaries, payout confirmations, and vendor onboarding alerts via email"
              />

              <FormCheckbox
                name="smsAlerts"
                label="SMS Mobile Alerts"
                description="Dispatch instant SMS alerts for critical payout threshold breaches"
              />

              <FormCheckbox
                name="pushAlerts"
                label="Browser Push Notifications"
                description="Enable real-time popover alerts in the admin console header"
              />

              <FormCheckbox
                name="securityAlerts"
                label="High-Priority Security Alerts"
                description="Receive urgent notifications for multi-factor failures or unauthorized login attempts"
              />

              <div className="flex justify-end pt-4 border-t border-[var(--border)] mt-4">
                <Button type="submit" variant="default" isLoading={updateMutation.isPending}>
                  Save Notification Channels
                </Button>
              </div>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
};
