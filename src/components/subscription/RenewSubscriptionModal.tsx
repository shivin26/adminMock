import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Form } from '../form/Form';
import { FormSelect } from '../form/FormSelect';
import { FormCheckbox } from '../form/FormCheckbox';
import { Button } from '../ui/Button';
import { renewSubscriptionSchema, RenewSubscriptionSchemaType } from '../../schemas/subscription.schema';
import { Subscription } from '../../types/subscription';
import { useRenewSubscription } from '../../hooks/useSubscription';

export interface RenewSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export const RenewSubscriptionModal: React.FC<RenewSubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
}) => {
  const renewMutation = useRenewSubscription();

  if (!subscription) return null;

  const defaultValues: Partial<RenewSubscriptionSchemaType> = {
    plan: subscription.plan,
    billingCycle: subscription.billingCycle,
    autoRenew: subscription.autoRenew,
  };

  const handleSubmit = async (values: RenewSubscriptionSchemaType) => {
    try {
      await renewMutation.mutateAsync({
        subscriptionId: subscription.id,
        plan: values.plan,
        billingCycle: values.billingCycle,
        autoRenew: values.autoRenew,
      });
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-[var(--gold)]" />
          <span>Renew Subscription Plan</span>
        </div>
      }
      description={`Renew or upgrade subscription for ${subscription.storeName} (${subscription.id})`}
    >
      <Form
        schema={renewSubscriptionSchema}
        onSubmit={handleSubmit}
        options={{ defaultValues }}
        key={subscription.id}
      >
        {() => (
          <div className="space-y-4 pt-2 font-body">
            <FormSelect
              name="plan"
              label="Select Subscription Tier"
              required
              options={[
                { label: 'Free Starter ($0/mo)', value: 'free' },
                { label: 'Pro Vendor ($49/mo)', value: 'pro' },
                { label: 'Enterprise Tier ($199/mo)', value: 'enterprise' },
              ]}
            />

            <FormSelect
              name="billingCycle"
              label="Billing Cycle"
              required
              options={[
                { label: 'Monthly Billing', value: 'monthly' },
                { label: 'Annual Billing (Save 20%)', value: 'annual' },
              ]}
            />

            <div className="pt-2">
              <FormCheckbox
                name="autoRenew"
                label="Enable Auto-Renewal at period end"
                description="Automatically charge saved payment method upon expiry"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)] mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                isLoading={renewMutation.isPending}
              >
                Confirm Renewal
              </Button>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};
