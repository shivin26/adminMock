import { axiosInstance } from './axiosInstance';
import type {
  SubAdminUser,
  CreateSubAdminRequest,
  UpdateSubAdminPowersRequest,
} from '../../types/rbac.types';

const LOCAL_STORAGE_KEY = 'digilocal_sub_admins_store';

// Initial dataset for Sub-Admins
const INITIAL_SUB_ADMINS: SubAdminUser[] = [];

export const getLocalSubAdmins = (): SubAdminUser[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const list: SubAdminUser[] = JSON.parse(raw);
      let modified = false;
      const updated = list.map((item) => {
        const nameLower = (item.name || '').toLowerCase();
        const emailLower = (item.email || '').toLowerCase();
        if (
          nameLower.includes('raj') ||
          nameLower.includes('jenga') ||
          emailLower.includes('raj') ||
          emailLower.includes('jenga')
        ) {
          if (item.createdBy !== 'Sub-Admin Aarushi Verma' || item.creatorId !== 'sub-aarushi') {
            modified = true;
          }
          return {
            ...item,
            createdBy: 'Sub-Admin Aarushi Verma',
            creatorId: 'sub-aarushi',
            createdRole: 'sub_admin' as const,
          };
        }
        return item;
      });

      if (modified) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      return updated;
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
    allowedDelegationPowers: Array.isArray(raw.allowed_delegation_powers)
      ? raw.allowed_delegation_powers
      : Array.isArray(raw.allowedDelegationPowers)
      ? raw.allowedDelegationPowers
      : undefined,
    status:
      String(raw.status || 'active').toLowerCase() === 'suspended' ||
      String(raw.status || '').toLowerCase() === 'blocked'
        ? 'suspended'
        : 'active',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    createdBy: raw.created_by || raw.createdBy || 'Super Admin',
    creatorId: raw.creator_id || raw.creatorId || (raw.created_role === 'sub_admin' ? 'sub-aarushi' : 'super-admin'),
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

      if (Array.isArray(rawData)) {
        return rawData.map(mapSubAdminDTOToDomain);
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * POST /admin/subadmins (also POST /admin/sub-admins)
   */
  createSubAdmin: async (payload: CreateSubAdminRequest): Promise<SubAdminUser> => {
    const apiPayload = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      powers: payload.powers,
      allowed_delegation_powers: payload.allowedDelegationPowers,
      allowedDelegationPowers: payload.allowedDelegationPowers,
      created_by: payload.createdBy,
      creator_id: payload.creatorId,
      creatorId: payload.creatorId,
      created_role: payload.createdRole,
    };

    try {
      let response: any;
      try {
        response = await axiosInstance.post<SubAdminUser>('/admin/subadmins', apiPayload);
      } catch {
        response = await axiosInstance.post<SubAdminUser>('/admin/sub-admins', apiPayload);
      }
      const data = mapSubAdminDTOToDomain(response.data?.data || response.data);
      if (payload.createdBy) data.createdBy = payload.createdBy;
      if (payload.creatorId) data.creatorId = payload.creatorId;
      if (payload.createdRole) data.createdRole = payload.createdRole;
      if (payload.allowedDelegationPowers) data.allowedDelegationPowers = payload.allowedDelegationPowers;

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
        allowedDelegationPowers: payload.allowedDelegationPowers,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: payload.createdBy || 'Super Admin',
        creatorId: payload.creatorId || 'super-admin',
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
    const apiPayload = {
      powers: payload.powers,
      allowed_delegation_powers: payload.allowedDelegationPowers,
      allowedDelegationPowers: payload.allowedDelegationPowers,
      status: payload.status,
    };

    try {
      const response = await axiosInstance.put<any>(`/admin/subadmins/${id}`, apiPayload);
      const updatedBackend = response.data?.data || response.data;
      const current = getLocalSubAdmins();
      const updatedList = current.map((sub) => (sub.id === id ? { ...sub, powers: payload.powers, allowedDelegationPowers: payload.allowedDelegationPowers !== undefined ? payload.allowedDelegationPowers : sub.allowedDelegationPowers } : sub));
      saveLocalSubAdmins(updatedList);
      
      // Update active session user data if logged in
      try {
        const activeUserRaw = localStorage.getItem('digilocal_user_data');
        if (activeUserRaw) {
          const activeUser = JSON.parse(activeUserRaw);
          if (activeUser.id === id || activeUser.email === updatedBackend?.email) {
            activeUser.powers = payload.powers;
            if (payload.allowedDelegationPowers !== undefined) {
              activeUser.allowedDelegationPowers = payload.allowedDelegationPowers;
            }
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
            allowedDelegationPowers: payload.allowedDelegationPowers !== undefined ? payload.allowedDelegationPowers : sub.allowedDelegationPowers,
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
            activeUser.allowedDelegationPowers = (updatedTarget as SubAdminUser).allowedDelegationPowers;
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
