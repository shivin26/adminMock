import { z } from 'zod';

// 15-digit Indian GSTIN regex validation
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const vendorSchema = z.object({
  storeName: z
    .string()
    .min(3, 'Store name must be at least 3 characters long')
    .max(100, 'Store name must not exceed 100 characters'),
  ownerName: z
    .string()
    .min(2, 'Owner name must be at least 2 characters long'),
  category: z.string().min(1, 'Please select a vendor category'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  website: z.string().url('Invalid website URL').or(z.literal('')).optional(),
  address: z.string().min(5, 'Store address is required'),
  societyName: z.string().min(1, 'Please assign a society'),
  gstin: z
    .string()
    .min(15, 'GSTIN must be 15 characters long')
    .max(15, 'GSTIN must be 15 characters long')
    .regex(gstinRegex, 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)'),
  businessType: z.enum([
    'Sole Proprietorship',
    'Partnership',
    'LLP',
    'Private Limited',
  ]),
  subscriptionTier: z.enum(['free', 'pro', 'enterprise']),
});

export type VendorSchemaType = z.infer<typeof vendorSchema>;
