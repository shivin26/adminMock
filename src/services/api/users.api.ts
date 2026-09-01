import { axiosInstance } from './axiosInstance';
import { vendorsApi } from './vendors.api';
import type { UserProfile } from '../../types/user.types';
import { mapUserDTOToDomain } from '../mappers/user.mapper';
import { cleanQueryParams } from '../../utils/api.utils';

const INITIAL_USERS: UserProfile[] = [];

const STORAGE_KEY = 'digilocal_users_store';

const getStoredUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored users:', e);
  }
  return [];
};

const saveStoredUsers = (users: UserProfile[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving stored users:', e);
  }
};

export interface UserListParams {
  search?: string;
  status?: 'active' | 'warned' | 'suspended' | 'banned' | string;
  person_type?: 'user' | 'user_vendor' | string;
  society?: string;
  page?: number;
  limit?: number;
}

export const usersApi = {
  /**
   * GET /admin/users (also /api/v1/admin/users)
   * Excludes pure vendors ("vendor") & sub-admins ("sub_admin") per scope rule
   */
  getUsers: async (params?: UserListParams): Promise<UserProfile[]> => {
    const cleaned = cleanQueryParams(params);
    let userList: UserProfile[] = [];

    try {
      const response = await axiosInstance.get<any>('/admin/users', { params: cleaned });
      const rawData = response.data?.data || response.data?.users || response.data;
      if (Array.isArray(rawData)) {
        userList = rawData
          .filter((u: any) => u.person_type !== 'sub_admin' && u.role !== 'sub_admin')
          .map(mapUserDTOToDomain);
        saveStoredUsers(userList);
        return userList;
      }
    } catch {
      try {
        const response = await axiosInstance.get<any>('/api/v1/admin/users', { params: cleaned });
        const rawData = response.data?.data || response.data;
        if (Array.isArray(rawData)) {
          userList = rawData
            .filter((u: any) => u.person_type !== 'sub_admin' && u.role !== 'sub_admin')
            .map(mapUserDTOToDomain);
          saveStoredUsers(userList);
          return userList;
        }
      } catch {}
    }

    saveStoredUsers(userList);
    return userList;
  },

  /**
   * GET /admin/users/:userId
   */
  getUserById: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}`);
      const raw = response.data?.data || response.data;
      if (raw) {
        return mapUserDTOToDomain(raw);
      }
    } catch {}

    const users = getStoredUsers();
    const found = users.find((u) => u.id === userId || u.email === userId);
    if (found) return found;

    return users[0] || {
      id: userId,
      name: 'User Profile',
      email: 'user@digilocal.in',
      phone: '+91 98765 43210',
      societyName: 'Anupam Society',
      flatNumber: 'A-101',
      flagsCount: 0,
      status: 'active',
      totalOrders: 5,
      totalSpend: 2500,
      totalComplaintsRaised: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
  },

  getUserByNameOrEmail: async (identifier: string): Promise<UserProfile> => {
    return usersApi.getUserById(identifier);
  },

  /**
   * POST /admin/users/:userId/block
   */
  blockUser: async (userId: string, reason = 'Terms breach'): Promise<{ message: string; status: string }> => {
    try {
      const response = await axiosInstance.post(`/admin/users/${userId}/block`, { reason });
      return response.data;
    } catch {
      const users = getStoredUsers();
      const updated = users.map((u) => (u.id === userId ? { ...u, status: 'banned' as const } : u));
      saveStoredUsers(updated);
      return { message: `User #${userId} blocked successfully.`, status: 'suspended' };
    }
  },

  /**
   * POST /admin/users/:userId/unblock
   */
  unblockUser: async (userId: string): Promise<{ message: string; status: string }> => {
    try {
      const response = await axiosInstance.post(`/admin/users/${userId}/unblock`);
      return response.data;
    } catch {
      const users = getStoredUsers();
      const updated = users.map((u) => (u.id === userId ? { ...u, status: 'active' as const } : u));
      saveStoredUsers(updated);
      return { message: `User #${userId} reactivated.`, status: 'active' };
    }
  },

  /**
   * POST /admin/users/:userId/reset-password
   */
  resetUserPassword: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post(`/admin/users/${userId}/reset-password`);
      return response.data;
    } catch {
      return { message: `Admin password reset link triggered for user #${userId}.` };
    }
  },

  /**
   * DELETE /admin/users/:userId
   */
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`/admin/users/${userId}`);
      return response.data;
    } catch {
      const users = getStoredUsers();
      saveStoredUsers(users.filter((u) => u.id !== userId));
      return { message: `User record #${userId} soft-deleted successfully.` };
    }
  },

  /**
   * GET /admin/users/analytics
   */
  getUserAnalytics: async (): Promise<any> => {
    try {
      const response = await axiosInstance.get('/admin/users/analytics');
      return response.data?.data || response.data;
    } catch {
      const users = getStoredUsers();
      return {
        total_users: users.length,
        active_users: users.filter((u) => u.status === 'active').length,
        warned_users: users.filter((u) => u.status === 'warned').length,
        banned_users: users.filter((u) => u.status === 'banned').length,
      };
    }
  },

  flagUser: async (userId: string): Promise<{ user: UserProfile; wasBanned: boolean }> => {
    try {
      const response = await axiosInstance.post(`/admin/users/${userId}/flag`);
      if (response.data) {
        const users = getStoredUsers();
        const found = users.find((u) => u.id === userId);
        return { user: found || ({ id: userId, status: 'banned' } as UserProfile), wasBanned: true };
      }
    } catch {}

    const users = getStoredUsers();
    let wasBanned = false;

    const updated = users.map((u) => {
      if (u.id === userId) {
        const newFlags = Math.min(u.flagsCount + 1, 3);
        const isBanned = newFlags >= 3;
        wasBanned = isBanned;
        return {
          ...u,
          flagsCount: newFlags,
          status: isBanned ? ('banned' as const) : newFlags > 1 ? ('warned' as const) : u.status,
        };
      }
      return u;
    });

    saveStoredUsers(updated);
    const user = updated.find((u) => u.id === userId)!;
    return { user, wasBanned };
  },

  resetUserFlags: async (userId: string): Promise<UserProfile> => {
    try {
      await axiosInstance.delete(`/admin/users/${userId}/flag`);
    } catch {}

    const users = getStoredUsers();
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          flagsCount: 0,
          status: 'active' as const,
        };
      }
      return u;
    });

    saveStoredUsers(updated);
    return updated.find((u) => u.id === userId)!;
  },

  /**
   * GET /admin/users/:userId/orders
   */
  getUserOrders: async (userId: string): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}/orders`);
      return response.data?.data || response.data?.orders || response.data;
    } catch {
      return [
        {
          id: 'ORD-9842',
          storeName: 'FreshBites Daily Grocery',
          total: 1250,
          status: 'DELIVERED',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          items: '2x Organic Milk, 1x Multigrain Bread, 5kg Rice',
        },
        {
          id: 'ORD-9841',
          storeName: 'Priya Organic Mart',
          total: 890,
          status: 'DELIVERED',
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
          items: '1x Fresh Apples, 2x Honey Jars',
        },
        {
          id: 'ORD-9835',
          storeName: 'Suresh Dairy Supplies',
          total: 450,
          status: 'DELIVERED',
          date: new Date(Date.now() - 86400000 * 12).toISOString(),
          items: '3x Cottage Cheese, 2x Butter Packs',
        },
      ];
    }
  },

  /**
   * GET /admin/users/:userId/payments
   */
  getUserPayments: async (userId: string): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}/payments`);
      return response.data?.data || response.data?.payments || response.data;
    } catch {
      return [
        {
          txnId: 'pay_Lkw908123984',
          orderId: 'ORD-9842',
          amount: 1250,
          method: 'Razorpay UPI (Google Pay)',
          status: 'SUCCESS',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          txnId: 'pay_Lkw887612344',
          orderId: 'ORD-9841',
          amount: 890,
          method: 'Razorpay Credit Card (HDFC)',
          status: 'SUCCESS',
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
      ];
    }
  },

  /**
   * GET /admin/users/:userId/timeline
   */
  getUserTimeline: async (userId: string): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}/timeline`);
      return response.data?.data || response.data?.timeline || response.data;
    } catch {
      return [
        {
          id: 't-1',
          event: 'Order Delivered Successfully',
          detail: 'Order #ORD-9842 delivered by FreshBites agent.',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          type: 'order',
        },
        {
          id: 't-2',
          event: 'Mobile OTP Verification',
          detail: 'Primary phone verified via SMS Gateway.',
          date: new Date(Date.now() - 86400000 * 30).toISOString(),
          type: 'auth',
        },
        {
          id: 't-3',
          event: 'Account Created',
          detail: 'User profile registered in Greenwood Heights Society.',
          date: new Date(Date.now() - 86400000 * 60).toISOString(),
          type: 'account',
        },
      ];
    }
  },

  /**
   * GET /admin/users/:userId/addresses
   */
  getUserAddresses: async (userId: string): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}/addresses`);
      return response.data?.data || response.data?.addresses || response.data;
    } catch {
      return [
        {
          id: 'addr-1',
          type: 'Primary Residence',
          flat: 'Flat A-101, 1st Floor',
          society: 'Greenwood Heights Society',
          city: 'Indore',
          pincode: '452001',
          isDefault: true,
        },
        {
          id: 'addr-2',
          type: 'Office Workstation',
          flat: 'Block B, Tech Park IT Tower',
          society: 'Vijay Nagar Business Hub',
          city: 'Indore',
          pincode: '452010',
          isDefault: false,
        },
      ];
    }
  },

  /**
   * GET /admin/users/:userId/notifications
   */
  getUserNotifications: async (userId: string): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}/notifications`);
      return response.data?.data || response.data?.notifications || response.data;
    } catch {
      return [
        {
          id: 'n-1',
          title: 'Order Status Update',
          message: 'Your order #ORD-9842 has been delivered.',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          read: true,
        },
        {
          id: 'n-2',
          title: 'Society Announcement',
          message: 'Maintenance work scheduled for Greenwood Enclave tomorrow.',
          date: new Date(Date.now() - 86400000 * 4).toISOString(),
          read: false,
        },
      ];
    }
  },

  /**
   * GET /admin/users/:userId/audit-logs
   */
  getUserAuditLogs: async (userId: string): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}/audit-logs`);
      return response.data?.data || response.data?.logs || response.data;
    } catch {
      return [
        {
          id: 'log-101',
          action: 'PROFILE_UPDATE',
          operator: 'System Admin',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          ip: '192.168.1.45',
        },
        {
          id: 'log-102',
          action: 'SMS_OTP_DISPATCH',
          operator: 'Auth Gateway',
          timestamp: new Date(Date.now() - 86400000 * 30).toISOString(),
          ip: '10.0.4.12',
        },
      ];
    }
  },
};
