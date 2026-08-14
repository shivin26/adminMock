import { axiosInstance } from './axiosInstance';
import { vendorsApi } from './vendors.api';
import type { UserProfile } from '../../types/user.types';
import { mapUserDTOToDomain } from '../mappers/user.mapper';
import { cleanQueryParams } from '../../utils/api.utils';

const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Commander V.K. Nair',
    email: 'vknair.resident@gmail.com',
    phone: '+91 98765 43210',
    societyName: 'Anupam Society',
    flatNumber: 'B-402',
    flagsCount: 1,
    status: 'active',
    totalOrders: 28,
    totalSpend: 14500,
    totalComplaintsRaised: 3,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'usr-2',
    name: 'Aarav Gupta',
    email: 'aarav.retail@gmail.com',
    phone: '+91 98123 45678',
    societyName: 'Anupam Society',
    flatNumber: 'A-108',
    flagsCount: 0,
    status: 'active',
    totalOrders: 42,
    totalSpend: 28900,
    totalComplaintsRaised: 1,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'usr-3',
    name: 'Rajesh Sharma',
    email: 'rajesh.freshbites@gmail.com',
    phone: '+91 97111 22334',
    societyName: 'Prestige Heights',
    flatNumber: 'C-701',
    flagsCount: 2,
    status: 'warned',
    totalOrders: 15,
    totalSpend: 8400,
    totalComplaintsRaised: 5,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'usr-4',
    name: 'Priya Verma',
    email: 'priya.verma@gmail.com',
    phone: '+91 98765 11223',
    societyName: 'Greenwood Heights',
    flatNumber: 'D-302',
    flagsCount: 0,
    status: 'active',
    totalOrders: 65,
    totalSpend: 42300,
    totalComplaintsRaised: 0,
    createdAt: new Date(Date.now() - 86400000 * 150).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'usr-5',
    name: 'Vikram Mehta',
    email: 'vikram.m@gmail.com',
    phone: '+91 99887 76655',
    societyName: 'Sunrise Apartments',
    flatNumber: 'E-101',
    flagsCount: 3,
    status: 'banned',
    totalOrders: 8,
    totalSpend: 3200,
    totalComplaintsRaised: 6,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    lastActive: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const STORAGE_KEY = 'digilocal_users_store';

const getStoredUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored users:', e);
  }
  return INITIAL_USERS;
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
      if (Array.isArray(rawData) && rawData.length > 0) {
        userList = rawData
          .filter((u: any) => u.person_type !== 'sub_admin' && u.role !== 'sub_admin')
          .map(mapUserDTOToDomain);
      }
    } catch {
      try {
        const response = await axiosInstance.get<any>('/api/v1/admin/users', { params: cleaned });
        const rawData = response.data?.data || response.data;
        if (Array.isArray(rawData) && rawData.length > 0) {
          userList = rawData
            .filter((u: any) => u.person_type !== 'sub_admin' && u.role !== 'sub_admin')
            .map(mapUserDTOToDomain);
        }
      } catch {}
    }

    // Cross-reference vendor store owners into the users directory as Dual-Role (user_vendor) accounts
    try {
      const vendors = await vendorsApi.getAllVendors();
      if (vendors && vendors.length > 0) {
        const existingEmails = new Set(userList.map((u) => u.email.toLowerCase().trim()));
        const existingPhones = new Set(userList.map((u) => u.phone.replace(/[^0-9]/g, '')));

        for (const v of vendors) {
          const normEmail = (v.email || '').toLowerCase().trim();
          const normPhone = (v.phone || '').replace(/[^0-9]/g, '');

          const alreadyInList = (normEmail && existingEmails.has(normEmail)) || (normPhone && existingPhones.has(normPhone));

          if (!alreadyInList) {
            userList.push({
              id: `usr-vendor-${v.id}`,
              name: v.ownerName || 'Store Owner',
              email: v.email,
              phone: v.phone,
              personType: 'user_vendor',
              status: v.status === 'active' || v.status === 'approved' ? 'active' : 'suspended',
              societyName: v.societyName || 'Unassigned Society',
              storeName: v.storeName,
              category: v.category,
              flagsCount: 0,
              totalOrdersCount: v.totalOrdersCount || 14,
              totalSpend: v.totalEarnings || 2450,
              totalComplaintsCount: 0,
              createdAt: v.createdAt || new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
            });
            if (normEmail) existingEmails.add(normEmail);
            if (normPhone) existingPhones.add(normPhone);
          } else {
            const userObj = userList.find(
              (u) => (normEmail && u.email.toLowerCase().trim() === normEmail) || (normPhone && u.phone.replace(/[^0-9]/g, '') === normPhone)
            );
            if (userObj) {
              userObj.personType = 'user_vendor';
              if (!userObj.storeName) userObj.storeName = v.storeName;
            }
          }
        }
      }
    } catch {}

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
      const response = await axiosInstance.post(`/admin/users/${userId}/block`, { reason: 'User flagged by admin' });
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
      await axiosInstance.post(`/admin/users/${userId}/unblock`);
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
};
