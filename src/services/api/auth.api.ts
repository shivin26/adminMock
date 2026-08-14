import { axiosInstance } from './axiosInstance';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  VendorLoginRequest,
  VendorLoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
} from '../../types/auth.types';

export const authApi = {
  /**
   * POST /auth/login (also /api/v1/auth/login)
   * Admin Staff Login
   */
  loginAdmin: async (payload: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const requestBody = {
      email: payload.email,
      password: payload.admin_secret || (payload as any).password,
      admin_secret: payload.admin_secret || (payload as any).password,
    };

    let rawData: any = null;

    try {
      const response = await axiosInstance.post('/auth/login', requestBody);
      rawData = response.data;
    } catch {
      try {
        const response = await axiosInstance.post('/api/v1/auth/login', requestBody);
        rawData = response.data;
      } catch {
        const response = await axiosInstance.post('/admin/login', requestBody);
        rawData = response.data;
      }
    }

    const unwrapped = rawData?.data || rawData;
    return {
      token: unwrapped?.token || unwrapped?.access_token || unwrapped?.accessToken || '',
      accessToken: unwrapped?.accessToken || unwrapped?.access_token || unwrapped?.token || '',
      refreshToken: unwrapped?.refreshToken || unwrapped?.refresh_token || '',
      role: unwrapped?.role || unwrapped?.user?.role || 'super_admin',
      user: unwrapped?.user || unwrapped,
    };
  },

  /**
   * GET /auth/me (also /api/v1/auth/me)
   * Fetch Active Profile
   */
  getMe: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch {
      const response = await axiosInstance.get('/api/v1/auth/me');
      return response.data;
    }
  },

  /**
   * POST /auth/login for vendors or vendor login
   */
  loginVendor: async (payload: VendorLoginRequest): Promise<VendorLoginResponse> => {
    try {
      const response = await axiosInstance.post<VendorLoginResponse>('/auth/login', payload);
      return response.data;
    } catch {
      const response = await axiosInstance.post<VendorLoginResponse>('/vendors/login', payload);
      return response.data;
    }
  },

  /**
   * POST /auth/refresh
   * Token Refresh Endpoint
   */
  refreshToken: async (payload: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    try {
      const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {
        refresh_token: payload.refreshToken || (payload as any).refresh_token,
      });
      return response.data;
    } catch {
      const response = await axiosInstance.post<RefreshTokenResponse>('/vendors/refresh', payload);
      return response.data;
    }
  },

  /**
   * POST /auth/logout
   * Protected Logout / Token Revocation Endpoint
   */
  logout: async (): Promise<LogoutResponse> => {
    try {
      const response = await axiosInstance.post<LogoutResponse>('/auth/logout');
      return response.data;
    } catch {
      const response = await axiosInstance.post<LogoutResponse>('/vendors/logout');
      return response.data;
    }
  },
};
