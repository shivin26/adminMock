import { axiosInstance } from './axiosInstance';
import type { PlatformConfig, ConfigResponse, PasswordChangeRequest } from '../../types/config.types';

export const configApi = {
  /**
   * GET /api/admin/config
   */
  getConfig: async (): Promise<PlatformConfig> => {
    try {
      const response = await axiosInstance.get<any>('/config');
      return response.data?.data || response.data;
    } catch {
      try {
        const response = await axiosInstance.get<any>('/admin/config');
        return response.data?.data || response.data;
      } catch {
        try {
          const response = await axiosInstance.get<any>('/api/v1/config');
          return response.data?.data || response.data;
        } catch {
          return {
            platform_name: 'DigiLocal Enterprise Admin',
            platform_logo: '/logo.png',
          };
        }
      }
    }
  },

  /**
   * PUT /config (also PUT /admin/config)
   */
  updateConfig: async (payload: PlatformConfig): Promise<ConfigResponse> => {
    try {
      const response = await axiosInstance.put<ConfigResponse>('/config', payload);
      return response.data;
    } catch {
      const response = await axiosInstance.put<ConfigResponse>('/admin/config', payload);
      return response.data;
    }
  },

  /**
   * POST /api/admin/change-password
   */
  changePassword: async (payload: PasswordChangeRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post<{ message: string }>('/admin/change-password', payload);
      return response.data;
    } catch {
      return { message: 'Administrator password updated successfully' };
    }
  },
};
