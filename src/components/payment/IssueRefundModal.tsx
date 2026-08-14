import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { Button } from '../ui/Button';
import { refundPaymentSchema, RefundPaymentSchemaType } from '../../schemas/payment.schema';
import { PaymentTransaction } from '../../types/payment';
import { useIssueRefund } from '../../hooks/usePayment';

export interface IssueRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction | null;
}

export const IssueRefundModal: React.FC<IssueRefundModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const issueRefundMutation = useIssueRefund();

  if (!transaction) return null;

  const defaultValues: Partial<RefundPaymentSchemaType> = {
    refundAmount: transaction.amount,
    reason: '',
  };

  const handleSubmit = async (values: RefundPaymentSchemaType) => {
    try {
      await issueRefundMutation.mutateAsync({
        transactionId: transaction.id,
        refundAmount: values.refundAmount,
        reason: values.reason,
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
      size="md"
      title={
        <div className="flex items-center gap-2 text-amber-600">
          <RefreshCw className="h-5 w-5" />
          <span>Issue Gateway Refund</span>
        </div>
      }
      description={`Process a refund for transaction ${transaction.id} (${transaction.storeName})`}
    >
      <Form
        schema={refundPaymentSchema}
        onSubmit={handleSubmit}
        options={{ defaultValues }}
        key={transaction.id}
      >
        {() => (
          <div className="space-y-4 pt-2 font-body">
            <div className="p-3.5 rounded-md bg-[var(--secondary)] border border-[var(--border)] space-y-1">
              <div className="flex justify-between text-xs font-body">
                <span className="text-[var(--muted-foreground)]">Original Transaction Amount:</span>
                <strong className="font-mono font-bold">${transaction.amount.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-xs font-body">
                <span className="text-[var(--muted-foreground)]">Gateway Provider:</span>
                <strong className="font-mono uppercase text-[var(--gold)]">{transaction.gatewayMethod}</strong>
              </div>
            </div>

            <FormInput
              name="refundAmount"
              label="Refund Amount ($)"
              type="number"
              step="0.01"
              required
              description={`Maximum allowed refund is $${transaction.amount}`}
            />

            <FormInput
              name="reason"
              label="Refund Reason"
              placeholder="Customer returned damaged goods / order cancellation"
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)] mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                isLoading={issueRefundMutation.isPending}
              >
                Process Refund
              </Button>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};
