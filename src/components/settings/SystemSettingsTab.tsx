import React from 'react';
import { Sliders } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { FormSelect } from '../form/FormSelect';
import { FormCheckbox } from '../form/FormCheckbox';
import { Button } from '../ui/Button';
import { systemSettingsSchema, SystemSettingsSchemaType } from '../../schemas/settings.schema';
import { SystemSettings } from '../../types/settings';
import { useUpdateSystemSettings } from '../../hooks/useSettings';

export interface SystemSettingsTabProps {
  data?: SystemSettings;
}

export const SystemSettingsTab: React.FC<SystemSettingsTabProps> = ({ data }) => {
  const updateMutation = useUpdateSystemSettings();

  const defaultValues: Partial<SystemSettingsSchemaType> = {
    maintenanceMode: data?.maintenanceMode ?? false,
    baseCurrency: data?.baseCurrency || 'USD',
    sessionTimeoutMinutes: data?.sessionTimeoutMinutes || 30,
    maxFileUploadMb: data?.maxFileUploadMb || 10,
  };

  const handleSubmit = async (values: SystemSettingsSchemaType) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-[var(--gold)]" />
          <CardTitle className="text-xl">System Parameters & Maintenance</CardTitle>
        </div>
        <CardDescription>PLATFORM-WIDE TIMEOUTS, CURRENCY PREFERENCES, AND MAINTENANCE MODES</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={systemSettingsSchema}
          onSubmit={handleSubmit}
          options={{ defaultValues }}
          key={data?.baseCurrency || 'system'}
        >
          {() => (
            <div className="space-y-4 pt-2 font-body">
              <FormCheckbox
                name="maintenanceMode"
                label="Enable Platform Maintenance Mode"
                description="Temporarily restrict non-admin access while performing system updates"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--border)] pt-4">
                <FormSelect
                  name="baseCurrency"
                  label="Base Display Currency"
                  required
                  options={[
                    { label: 'USD ($)', value: 'USD' },
                    { label: 'INR (₹)', value: 'INR' },
                    { label: 'EUR (€)', value: 'EUR' },
                    { label: 'GBP (£)', value: 'GBP' },
                  ]}
                />
                <FormInput
                  name="sessionTimeoutMinutes"
                  label="Session Inactivity Timeout (Minutes)"
                  type="number"
                  required
                  description="Auto-logout after inactivity"
                />
                <FormInput
                  name="maxFileUploadMb"
                  label="Max File Upload Limit (MB)"
                  type="number"
                  required
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border)] mt-4">
                <Button type="submit" variant="default" isLoading={updateMutation.isPending}>
                  Save System Parameters
                </Button>
              </div>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
};
