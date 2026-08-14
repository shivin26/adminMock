import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../../constants/env.constants';
import { storage } from '../../utils/storage.utils';

// AbortController Map for Request Cancellation
const activeCancelTokens = new Map<string, AbortController>();

export const getRequestCancelToken = (requestKey: string): AbortSignal => {
  if (activeCancelTokens.has(requestKey)) {
    activeCancelTokens.get(requestKey)?.abort();
  }
  const controller = new AbortController();
  activeCancelTokens.set(requestKey, controller);
  return controller.signal;
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Platform-Client': 'admin_dashboard',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Authorization Bearer token & ENV header
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken() || storage.getAdminToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle API errors gracefully without forced page reloads
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Ignore request cancellation errors
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Do NOT wipe auth or force window.location reloads on 401
    // Rejecting the error allows API service try/catch blocks to gracefully fall back to local mock data
    return Promise.reject(error);
  }
);
