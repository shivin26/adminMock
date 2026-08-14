import { z } from 'zod';

export const renewSubscriptionSchema = z.object({
  plan: z.enum(['free', 'pro', 'enterprise']),
  billingCycle: z.enum(['monthly', 'annual']),
  autoRenew: z.boolean(),
});

export type RenewSubscriptionSchemaType = z.infer<typeof renewSubscriptionSchema>;

export const cancelSubscriptionSchema = z.object({
  reason: z
    .string()
    .min(5, 'Cancellation reason must be at least 5 characters long')
    .max(300, 'Reason cannot exceed 300 characters'),
});

export type CancelSubscriptionSchemaType = z.infer<typeof cancelSubscriptionSchema>;
