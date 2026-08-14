import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { storage } from '../../utils/storage.utils';
import type { RefreshTokenResponse } from '../../types/auth.types';


const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://172.25.12.195:5001/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Platform-Client': 'admin_dashboard',
  },
  timeout: 15000,
});

// Flag and Queue for token refresh concurrent handling
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

// Request Interceptor: Attach Authorization Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken() || storage.getAdminToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 automatic token refresh queue
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = storage.getRefreshToken();

      // If no refresh token exists or it's a login attempt, fail & clear auth
      if (!refreshToken || originalRequest.url?.includes('/login')) {
        storage.clearAuth();
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<RefreshTokenResponse>(`${BASE_URL}/vendors/refresh`, {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken || response.data.token;
        if (newAccessToken) {
          storage.setAccessToken(newAccessToken);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh response missing access token');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        storage.clearAuth();
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
