import { z } from 'zod';

export const adminProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  designation: z.string().min(2, 'Designation / role is required'),
  avatarUrl: z.string().url('Invalid image URL').or(z.literal('')).optional(),
});

export type AdminProfileSchemaType = z.infer<typeof adminProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters long'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;

export const emailSettingsSchema = z.object({
  smtpHost: z.string().min(2, 'SMTP Host is required'),
  smtpPort: z.number({ invalid_type_error: 'Port must be a number' }).positive(),
  smtpUser: z.string().min(2, 'SMTP Username is required'),
  senderEmail: z.string().email('Invalid sender email address'),
  senderName: z.string().min(2, 'Sender name is required'),
  encryptionMode: z.enum(['tls', 'ssl', 'none']),
});

export type EmailSettingsSchemaType = z.infer<typeof emailSettingsSchema>;

export const taxSettingsSchema = z.object({
  defaultTaxRate: z
    .number({ invalid_type_error: 'Please enter a valid tax percentage' })
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  taxRegistrationNumber: z.string().min(3, 'Tax Registration Number is required'),
  hsnCode: z.string().min(2, 'HSN/SAC Code is required'),
  isTaxEnabled: z.boolean(),
});

export type TaxSettingsSchemaType = z.infer<typeof taxSettingsSchema>;

export const subscriptionPlanConfigSchema = z.object({
  freePrice: z.number().min(0),
  proMonthlyPrice: z.number().min(0),
  proAnnualPrice: z.number().min(0),
  enterpriseMonthlyPrice: z.number().min(0),
  enterpriseAnnualPrice: z.number().min(0),
});

export type SubscriptionPlanConfigSchemaType = z.infer<typeof subscriptionPlanConfigSchema>;

export const systemSettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  baseCurrency: z.string().min(1, 'Base currency is required'),
  sessionTimeoutMinutes: z.number().min(5, 'Minimum timeout is 5 minutes'),
  maxFileUploadMb: z.number().min(1, 'Minimum upload limit is 1MB'),
});

export type SystemSettingsSchemaType = z.infer<typeof systemSettingsSchema>;

export const notificationPreferencesSchema = z.object({
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  pushAlerts: z.boolean(),
  securityAlerts: z.boolean(),
});

export type NotificationPreferencesSchemaType = z.infer<typeof notificationPreferencesSchema>;

export const brandingSchema = z.object({
  brandName: z.string().min(2, 'Brand Name is required'),
  tagline: z.string().min(2, 'Tagline is required'),
  primaryColor: z.string().min(4, 'Valid hex/HSL color required'),
  logoUrl: z.string().url('Invalid logo URL').or(z.literal('')).optional(),
});

export type BrandingSchemaType = z.infer<typeof brandingSchema>;
