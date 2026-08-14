import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { normalizeError } from '../utils/error-handler';

type TokenGetter = () => string | null;
type TokenRefresher = () => Promise<string | null>;
type OnUnauthorizedCallback = () => void;

interface InterceptorOptions {
  getToken: TokenGetter;
  refreshToken: TokenRefresher;
  onUnauthorized: OnUnauthorizedCallback;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

export function setupInterceptors(
  axiosInstance: AxiosInstance,
  options: InterceptorOptions
): void {
  const { getToken, refreshToken, onUnauthorized } = options;

  // Request Interceptor: Attach Access Token
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: unknown) => {
      return Promise.reject(normalizeError(error));
    }
  );

  // Response Interceptor: Token Refresh Queue & Error Handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized Error & Automatic Token Refresh
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(axiosInstance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshToken();

          if (newToken) {
            isRefreshing = false;
            onRefreshed(newToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return axiosInstance(originalRequest);
          } else {
            isRefreshing = false;
            refreshSubscribers = [];
            onUnauthorized();
            return Promise.reject(normalizeError(error));
          }
        } catch (refreshErr) {
          isRefreshing = false;
          refreshSubscribers = [];
          onUnauthorized();
          return Promise.reject(normalizeError(refreshErr));
        }
      }

      return Promise.reject(normalizeError(error));
    }
  );
}
