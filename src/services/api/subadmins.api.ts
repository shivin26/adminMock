import { axiosInstance } from './axiosInstance';
import type {
  SubAdminUser,
  CreateSubAdminRequest,
  UpdateSubAdminPowersRequest,
} from '../../types/rbac.types';

const LOCAL_STORAGE_KEY = 'digilocal_sub_admins_store';

// Mock initial dataset for Sub-Admins
const INITIAL_SUB_ADMINS: SubAdminUser[] = [
  {
    id: 'sub-1',
    name: 'Vikram Mehta',
    email: 'vikram.admin@digilocal.com',
    password: 'password123',
    role: 'sub_admin',
    powers: ['SOCIETIES', 'VENDORS', 'SUB_ADMINS'],
    status: 'active',
    createdAt: '2026-08-01T10:00:00Z',
    createdBy: 'Super Admin',
    createdRole: 'super_admin',
  },
  {
    id: 'sub-aarushi',
    name: 'Aarushi Verma',
    email: 'aarushi.admin@digilocal.com',
    password: 'password123',
    role: 'sub_admin',
    powers: ['SOCIETIES', 'VENDORS', 'SUB_ADMINS'],
    status: 'active',
    createdAt: '2026-08-01T11:00:00Z',
    createdBy: 'Super Admin',
    createdRole: 'super_admin',
  },
  {
    id: 'sub-2',
    name: 'Ananya Sharma',
    email: 'ananya.finance@digilocal.com',
    password: 'password123',
    role: 'sub_admin',
    powers: ['SUBSCRIPTIONS'],
    status: 'active',
    createdAt: '2026-08-02T14:30:00Z',
    createdBy: 'Sub-Admin Vikram Mehta',
    createdRole: 'sub_admin',
  },
  {
    id: 'sub-raj',
    name: 'Raj Kumar',
    email: 'raj.admin@digilocal.com',
    password: 'password123',
    role: 'sub_admin',
    powers: ['SOCIETIES', 'VENDORS'],
    status: 'active',
    createdAt: '2026-08-15T12:00:00Z',
    createdBy: 'Sub-Admin Aarushi Verma',
    createdRole: 'sub_admin',
  },
  {
    id: 'sub-jenga',
    name: 'Jenga Roy',
    email: 'jenga.admin@digilocal.com',
    password: 'password123',
    role: 'sub_admin',
    powers: ['SUBSCRIPTIONS', 'SUPPORT'],
    status: 'active',
    createdAt: '2026-08-16T15:00:00Z',
    createdBy: 'Sub-Admin Aarushi Verma',
    createdRole: 'sub_admin',
  },
];

export const getLocalSubAdmins = (): SubAdminUser[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const list: SubAdminUser[] = JSON.parse(raw);
      let modified = false;
      const updated = list.map((item) => {
        const nameLower = (item.name || '').toLowerCase();
        if (
          (nameLower.includes('raj') || nameLower.includes('jenga')) &&
          (!item.createdBy || item.createdBy === 'Super Admin' || item.createdRole === 'super_admin')
        ) {
          modified = true;
          return {
            ...item,
            createdBy: 'Sub-Admin Aarushi Verma',
            createdRole: 'sub_admin' as const,
          };
        }
        return item;
      });

      if (modified) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      return list;
    }
  } catch {}
  return INITIAL_SUB_ADMINS;
};

const saveLocalSubAdmins = (list: SubAdminUser[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {}
};

export const mapSubAdminDTOToDomain = (raw: any): SubAdminUser => {
  return {
    id: String(raw.id || raw.subadmin_id || `sub-${Date.now()}`),
    name: raw.name || raw.user_name || 'Sub Admin',
    email: raw.email || 'subadmin@digilocal.in',
    password: raw.password || 'password123',
    role: 'sub_admin',
    powers: Array.isArray(raw.powers)
      ? raw.powers
      : Array.isArray(raw.power_permissions)
      ? raw.power_permissions
      : ['SOCIETIES'],
    status:
      String(raw.status || 'active').toLowerCase() === 'suspended' ||
      String(raw.status || '').toLowerCase() === 'blocked'
        ? 'suspended'
        : 'active',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    createdBy: raw.created_by || raw.createdBy || 'Super Admin',
    createdRole: raw.created_role || raw.createdRole || 'super_admin',
  };
};

export const subAdminsApi = {
  /**
   * GET /admin/subadmins (also GET /admin/sub-admins)
   */
  getSubAdmins: async (): Promise<SubAdminUser[]> => {
    try {
      let rawData: any;
      try {
        const response = await axiosInstance.get<any>('/admin/sub-admins');
        rawData = response.data?.data || response.data?.subadmins || response.data;
      } catch {
        const response = await axiosInstance.get<any>('/admin/subadmins');
        rawData = response.data?.data || response.data?.subadmins || response.data;
      }

      if (Array.isArray(rawData) && rawData.length > 0) {
        const mapped = rawData.map(mapSubAdminDTOToDomain);
        saveLocalSubAdmins(mapped);
        return mapped;
      }
      return getLocalSubAdmins();
    } catch {
      return getLocalSubAdmins();
    }
  },

  /**
   * POST /admin/subadmins (also POST /admin/sub-admins)
   */
  createSubAdmin: async (payload: CreateSubAdminRequest): Promise<SubAdminUser> => {
    try {
      let response: any;
      try {
        response = await axiosInstance.post<SubAdminUser>('/admin/subadmins', payload);
      } catch {
        response = await axiosInstance.post<SubAdminUser>('/admin/sub-admins', payload);
      }
      const data = mapSubAdminDTOToDomain(response.data?.data || response.data);
      if (payload.createdBy) data.createdBy = payload.createdBy;
      if (payload.createdRole) data.createdRole = payload.createdRole;

      const current = getLocalSubAdmins();
      saveLocalSubAdmins([data, ...current]);
      return data;
    } catch {
      const newSubAdmin: SubAdminUser = {
        id: `sub-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        password: payload.password || 'password123',
        role: 'sub_admin',
        powers: payload.powers,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: payload.createdBy || 'Super Admin',
        createdRole: payload.createdRole || 'super_admin',
      };
      const current = getLocalSubAdmins();
      const updated = [newSubAdmin, ...current];
      saveLocalSubAdmins(updated);
      return newSubAdmin;
    }
  },

  /**
   * POST /admin/subadmins/:id/toggle-status
   */
  toggleSubAdminStatus: async (
    id: string,
    status?: 'active' | 'suspended' | 'blocked'
  ): Promise<{ message: string; subAdmin: SubAdminUser }> => {
    try {
      const response = await axiosInstance.post(`/admin/subadmins/${id}/toggle-status`, { status });
      return response.data;
    } catch {
      const current = getLocalSubAdmins();
      let updatedSubAdmin!: SubAdminUser;
      const updatedList = current.map((sub) => {
        if (sub.id === id) {
          const nextStatus = status || (sub.status === 'active' ? 'suspended' : 'active');
          updatedSubAdmin = { ...sub, status: nextStatus as any };
          return updatedSubAdmin;
        }
        return sub;
      });
      saveLocalSubAdmins(updatedList);
      return {
        message: `Sub-admin #${id} status updated successfully.`,
        subAdmin: updatedSubAdmin || current[0],
      };
    }
  },

  /**
   * PUT /admin/subadmins/:id
   */
  updateSubAdminPowers: async (
    id: string,
    payload: UpdateSubAdminPowersRequest
  ): Promise<SubAdminUser> => {
    try {
      const response = await axiosInstance.put<any>(`/admin/subadmins/${id}`, payload);
      const updatedBackend = response.data?.data || response.data;
      const current = getLocalSubAdmins();
      const updatedList = current.map((sub) => (sub.id === id ? { ...sub, powers: payload.powers } : sub));
      saveLocalSubAdmins(updatedList);
      
      // Update active session user data if logged in
      try {
        const activeUserRaw = localStorage.getItem('digilocal_user_data');
        if (activeUserRaw) {
          const activeUser = JSON.parse(activeUserRaw);
          if (activeUser.id === id || activeUser.email === updatedBackend?.email) {
            activeUser.powers = payload.powers;
            localStorage.setItem('digilocal_user_data', JSON.stringify(activeUser));
          }
        }
      } catch {}

      return updatedBackend;
    } catch {
      const current = getLocalSubAdmins();
      let updatedTarget: SubAdminUser | null = null;
      const updatedList = current.map((sub) => {
        if (sub.id === id) {
          updatedTarget = {
            ...sub,
            powers: payload.powers,
            status: payload.status || sub.status,
          };
          return updatedTarget;
        }
        return sub;
      });
      saveLocalSubAdmins(updatedList);

      // Update active session user data if logged in
      try {
        const activeUserRaw = localStorage.getItem('digilocal_user_data');
        if (activeUserRaw && updatedTarget) {
          const activeUser = JSON.parse(activeUserRaw);
          if (activeUser.id === id || activeUser.email === (updatedTarget as SubAdminUser).email) {
            activeUser.powers = payload.powers;
            localStorage.setItem('digilocal_user_data', JSON.stringify(activeUser));
          }
        }
      } catch {}

      const updated = updatedList.find((s) => s.id === id);
      if (!updated) throw new Error('Sub-admin not found');
      return updated;
    }
  },

  /**
   * DELETE /admin/subadmins/:id
   */
  deleteSubAdmin: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete<{ message: string }>(`/admin/subadmins/${id}`);
      const current = getLocalSubAdmins();
      saveLocalSubAdmins(current.filter((sub) => sub.id !== id));
      return response.data;
    } catch {
      const current = getLocalSubAdmins();
      saveLocalSubAdmins(current.filter((sub) => sub.id !== id));
      return { message: 'Sub-admin account revoked successfully' };
    }
  },
};
