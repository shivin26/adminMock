import axios, { AxiosInstance } from 'axios';
import { env } from '../env';

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Platform-Client': 'admin_dashboard',
  },
  withCredentials: true,
});


apiClient.interceptors.request.use((config) => {
  if (config.url && config.baseURL && config.baseURL.endsWith('/api') && config.url.startsWith('/api/')) {
    config.url = config.url.substring(4);
  }
  return config;
});
