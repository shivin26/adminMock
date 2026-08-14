export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://172.25.12.195:5001/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'DigiLocal Enterprise Admin',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  QUERY_STALE_TIME_MS: Number(import.meta.env.VITE_QUERY_STALE_TIME_MS) || 5 * 60 * 1000,
  QUERY_CACHE_TIME_MS: Number(import.meta.env.VITE_QUERY_CACHE_TIME_MS) || 15 * 60 * 1000,
} as const;

export type EnvConfig = typeof ENV;
