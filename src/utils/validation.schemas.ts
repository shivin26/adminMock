import { z } from 'zod';

export const adminSecretLoginSchema = z.object({
  admin_secret: z.string().min(1, 'Admin secret key is required'),
  email: z.string().email('Please enter a valid email address'),
});

export const vendorLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createSocietySchema = z.object({
  name: z.string().min(2, 'Society name must be at least 2 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  address: z.string().min(5, 'Full address is required'),
});

export const editSocietySchema = createSocietySchema.extend({});

export const updateBrandingSchema = z.object({
  platform_name: z.string().min(2, 'Platform name is required'),
  platform_logo: z.string().url('Please enter a valid image URL'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type AdminSecretFormValues = z.infer<typeof adminSecretLoginSchema>;
export type VendorLoginFormValues = z.infer<typeof vendorLoginSchema>;
export type CreateSocietyFormValues = z.infer<typeof createSocietySchema>;
export type EditSocietyFormValues = z.infer<typeof editSocietySchema>;
export type UpdateBrandingFormValues = z.infer<typeof updateBrandingSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
