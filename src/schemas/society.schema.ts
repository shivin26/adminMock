import { z } from 'zod';

export const societySchema = z.object({
  name: z
    .string()
    .min(3, 'Society name must be at least 3 characters long')
    .max(100, 'Society name must not exceed 100 characters'),
  code: z
    .string()
    .min(3, 'Society code must be at least 3 characters long')
    .max(20, 'Society code must not exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, hyphens, or underscores'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal/Zip Code is required'),
  address: z.string().min(5, 'Full street address is required'),
});

export type SocietySchemaType = z.infer<typeof societySchema>;
