import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { Button } from '../ui/Button';
import { cancelSubscriptionSchema, CancelSubscriptionSchemaType } from '../../schemas/subscription.schema';
import { Subscription } from '../../types/subscription';
import { useCancelSubscription } from '../../hooks/useSubscription';

export interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
}) => {
  const cancelMutation = useCancelSubscription();

  if (!subscription) return null;

  const handleSubmit = async (values: CancelSubscriptionSchemaType) => {
    try {
      await cancelMutation.mutateAsync({
        subscriptionId: subscription.id,
        reason: values.reason,
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
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>Cancel Subscription</span>
        </div>
      }
      description={`Cancel active subscription for ${subscription.storeName} (${subscription.id})`}
    >
      <Form schema={cancelSubscriptionSchema} onSubmit={handleSubmit} key={subscription.id}>
        {() => (
          <div className="space-y-4 pt-2 font-body">
            <p className="text-xs text-[var(--muted-foreground)]">
              Are you sure you want to cancel this subscription? Auto-renew will be disabled and merchant features will terminate at the end of the billing period.
            </p>

            <FormInput
              name="reason"
              label="Cancellation Reason"
              placeholder="e.g., Merchant requested downgrade, store closed..."
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)] mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Keep Subscription
              </Button>
              <Button
                type="submit"
                variant="destructive"
                isLoading={cancelMutation.isPending}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};
