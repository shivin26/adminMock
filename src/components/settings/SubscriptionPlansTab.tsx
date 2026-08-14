import React from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { Button } from '../ui/Button';
import { subscriptionPlanConfigSchema, SubscriptionPlanConfigSchemaType } from '../../schemas/settings.schema';
import { SubscriptionPlanConfig } from '../../types/settings';
import { useUpdateSubscriptionPlans } from '../../hooks/useSettings';

export interface SubscriptionPlansTabProps {
  data?: SubscriptionPlanConfig;
}

export const SubscriptionPlansTab: React.FC<SubscriptionPlansTabProps> = ({ data }) => {
  const updateMutation = useUpdateSubscriptionPlans();

  const defaultValues: Partial<SubscriptionPlanConfigSchemaType> = {
    freePrice: data?.freePrice ?? 0,
    proMonthlyPrice: data?.proMonthlyPrice ?? 49,
    proAnnualPrice: data?.proAnnualPrice ?? 490,
    enterpriseMonthlyPrice: data?.enterpriseMonthlyPrice ?? 199,
    enterpriseAnnualPrice: data?.enterpriseAnnualPrice ?? 1990,
  };

  const handleSubmit = async (values: SubscriptionPlanConfigSchemaType) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[var(--gold)]" />
          <CardTitle className="text-xl">Subscription Plans & Pricing Tiers</CardTitle>
        </div>
        <CardDescription>CONFIGURE RECURRING BILLING PRICING STRUCTURE FOR MERCHANT TIERS</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={subscriptionPlanConfigSchema}
          onSubmit={handleSubmit}
          options={{ defaultValues }}
          key={data?.proMonthlyPrice || 'plans'}
        >
          {() => (
            <div className="space-y-6 pt-2 font-body">
              {/* Free Starter Tier */}
              <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-3">
                <h4 className="font-serif font-bold text-base">Free Starter Tier</h4>
                <div className="w-full sm:w-64">
                  <FormInput name="freePrice" label="Free Plan Price ($)" type="number" disabled placeholder="0" />
                </div>
              </div>

              {/* Pro Tier */}
              <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-3">
                <h4 className="font-serif font-bold text-base text-[var(--gold)]">Pro Vendor Tier</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput name="proMonthlyPrice" label="Pro Monthly Price ($/mo)" type="number" required />
                  <FormInput name="proAnnualPrice" label="Pro Annual Price ($/yr)" type="number" required />
                </div>
              </div>

              {/* Enterprise Tier */}
              <div className="p-4 rounded-md bg-[var(--card)] border border-[var(--border)] space-y-3">
                <h4 className="font-serif font-bold text-base text-[var(--primary)]">Enterprise Tier</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput name="enterpriseMonthlyPrice" label="Enterprise Monthly Price ($/mo)" type="number" required />
                  <FormInput name="enterpriseAnnualPrice" label="Enterprise Annual Price ($/yr)" type="number" required />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border)]">
                <Button type="submit" variant="default" isLoading={updateMutation.isPending}>
                  Save Plan Pricing
                </Button>
              </div>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
};
