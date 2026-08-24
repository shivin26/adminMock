import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('https://digi-local-backend.onrender.com/api'),
  VITE_APP_NAME: z.string().default('Digi Local Admin'),
  VITE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  VITE_ENABLE_MOCK_API: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables schema validation failure.');
  }

  return result.data;
};

export const env = parseEnv();
