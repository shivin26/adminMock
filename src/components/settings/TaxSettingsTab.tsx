import React from 'react';
import { FileCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { FormCheckbox } from '../form/FormCheckbox';
import { Button } from '../ui/Button';
import { taxSettingsSchema, TaxSettingsSchemaType } from '../../schemas/settings.schema';
import { TaxSettings } from '../../types/settings';
import { useUpdateTaxSettings } from '../../hooks/useSettings';

export interface TaxSettingsTabProps {
  data?: TaxSettings;
}

export const TaxSettingsTab: React.FC<TaxSettingsTabProps> = ({ data }) => {
  const updateMutation = useUpdateTaxSettings();

  const defaultValues: Partial<TaxSettingsSchemaType> = {
    defaultTaxRate: data?.defaultTaxRate || 18,
    taxRegistrationNumber: data?.taxRegistrationNumber || '',
    hsnCode: data?.hsnCode || '',
    isTaxEnabled: data?.isTaxEnabled ?? true,
  };

  const handleSubmit = async (values: TaxSettingsSchemaType) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-[var(--gold)]" />
          <CardTitle className="text-xl">Tax & GST Configuration</CardTitle>
        </div>
        <CardDescription>PLATFORM GST COMPLIANCE, DEFAULT TAX RATES, AND REGISTRATION CODES</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={taxSettingsSchema}
          onSubmit={handleSubmit}
          options={{ defaultValues }}
          key={data?.taxRegistrationNumber || 'tax'}
        >
          {() => (
            <div className="space-y-4 pt-2 font-body">
              <FormCheckbox
                name="isTaxEnabled"
                label="Enable Automatic GST Calculation"
                description="Automatically apply platform GST tax on merchant invoices and payouts"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--border)] pt-4">
                <FormInput
                  name="defaultTaxRate"
                  label="Default GST Rate (%)"
                  type="number"
                  step="0.1"
                  placeholder="18.0"
                  required
                />
                <FormInput
                  name="taxRegistrationNumber"
                  label="Tax Registration (GSTIN)"
                  placeholder="22AAAAA0000A1Z5"
                  required
                />
                <FormInput
                  name="hsnCode"
                  label="Primary HSN / SAC Code"
                  placeholder="998314"
                  required
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border)] mt-4">
                <Button type="submit" variant="default" isLoading={updateMutation.isPending}>
                  Save Tax Settings
                </Button>
              </div>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
};
