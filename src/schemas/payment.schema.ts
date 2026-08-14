import { z } from 'zod';

export const refundPaymentSchema = z.object({
  refundAmount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Refund amount must be greater than zero'),
  reason: z
    .string()
    .min(5, 'Refund reason must be at least 5 characters long')
    .max(300, 'Reason cannot exceed 300 characters'),
});

export type RefundPaymentSchemaType = z.infer<typeof refundPaymentSchema>;
