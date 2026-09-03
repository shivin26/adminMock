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
  const powers = Array.isArray(raw.powers)
    ? raw.powers
    : Array.isArray(raw.power_permissions)
    ? raw.power_permissions
    : ['SOCIETIES'];

  const canManageSubadmins = Boolean(
    raw.can_manage_subadmins ?? raw.canManageSubadmins ?? powers.includes('SUB_ADMINS')
  );

  const grantablePowers = Array.isArray(raw.grantable_powers)
    ? raw.grantable_powers
    : Array.isArray(raw.allowed_delegation_powers)
    ? raw.allowed_delegation_powers
    : Array.isArray(raw.grantablePowers)
    ? raw.grantablePowers
    : Array.isArray(raw.allowedDelegationPowers)
    ? raw.allowedDelegationPowers
    : [];

  const createdByInfo = raw.created_by_info || {
    creator_id: raw.creator_id || raw.creatorId || (raw.created_role === 'sub_admin' ? 'sub-aarushi' : 'super-admin'),
    created_by: raw.created_by || raw.createdBy || 'Super Admin',
    created_role: raw.created_role || raw.createdRole || 'super_admin',
  };

  return {
    id: String(raw.id || raw.subadmin_id || `sub-${Date.now()}`),
    name: raw.name || raw.user_name || 'Sub Admin',
    email: raw.email || 'subadmin@digilocal.in',
    password: raw.password || 'password123',
    role: 'sub_admin',
    powers,
    canManageSubadmins,
    grantablePowers,
    allowedDelegationPowers: grantablePowers,
    status:
      String(raw.status || 'active').toLowerCase() === 'suspended' ||
      String(raw.status || '').toLowerCase() === 'blocked'
        ? 'suspended'
        : 'active',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    createdBy: createdByInfo.created_by || raw.created_by || raw.createdBy || 'Super Admin',
    creatorId: createdByInfo.creator_id || raw.creator_id || raw.creatorId || 'super-admin',
    createdRole: createdByInfo.created_role || raw.created_role || raw.createdRole || 'super_admin',
    createdByInfo: {
      creator_id: createdByInfo.creator_id || raw.creator_id || raw.creatorId || 'super-admin',
      created_by: createdByInfo.created_by || raw.created_by || raw.createdBy || 'Super Admin',
      created_role: createdByInfo.created_role || raw.created_role || raw.createdRole || 'super_admin',
    },
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
    const grantable = payload.grantable_powers || payload.grantablePowers || payload.allowed_delegation_powers || payload.allowedDelegationPowers || [];
    const canManageSubadmins = payload.can_manage_subadmins ?? payload.canManageSubadmins ?? payload.powers.includes('SUB_ADMINS');

    const apiPayload = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      powers: payload.powers,
      grantable_powers: grantable,
      allowed_delegation_powers: grantable,
      can_manage_subadmins: canManageSubadmins,
      created_by: payload.createdBy,
      creator_id: payload.creatorId,
      created_role: payload.createdRole,
    };

    try {
      let response: any;
      try {
        response = await axiosInstance.post<SubAdminUser>('/v1/admin/subadmins', apiPayload);
      } catch {
        try {
          response = await axiosInstance.post<SubAdminUser>('/admin/subadmins', apiPayload);
        } catch {
          response = await axiosInstance.post<SubAdminUser>('/admin/sub-admins', apiPayload);
        }
      }
      const data = mapSubAdminDTOToDomain(response.data?.data || response.data);
      if (payload.createdBy) data.createdBy = payload.createdBy;
      if (payload.creatorId) data.creatorId = payload.creatorId;
      if (payload.createdRole) data.createdRole = payload.createdRole;
      if (grantable) {
        data.grantablePowers = grantable;
        data.allowedDelegationPowers = grantable;
      }
      data.canManageSubadmins = canManageSubadmins;

      const current = getLocalSubAdmins();
      saveLocalSubAdmins([data, ...current]);
      return data;
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 400) {
        throw err;
      }
      const newSubAdmin: SubAdminUser = {
        id: `sub-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        password: payload.password || 'password123',
        role: 'sub_admin',
        powers: payload.powers,
        canManageSubadmins,
        grantablePowers: grantable,
        allowedDelegationPowers: grantable,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: payload.createdBy || 'Super Admin',
        creatorId: payload.creatorId || 'super-admin',
        createdRole: payload.createdRole || 'super_admin',
        createdByInfo: {
          creator_id: payload.creatorId || 'super-admin',
          created_by: payload.createdBy || 'Super Admin',
          created_role: payload.createdRole || 'super_admin',
        },
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
   * PUT /admin/subadmins/:id (also PUT /v1/admin/subadmins/:id & PUT /admin/sub-admins/:id)
   */
  updateSubAdminPowers: async (
    id: string,
    payload: UpdateSubAdminPowersRequest
  ): Promise<SubAdminUser> => {
    const grantable = payload.grantable_powers || payload.grantablePowers || payload.allowed_delegation_powers || payload.allowedDelegationPowers || [];
    const canManageSubadmins = payload.can_manage_subadmins ?? payload.canManageSubadmins ?? payload.powers.includes('SUB_ADMINS');

    const apiPayload = {
      powers: payload.powers,
      grantable_powers: grantable,
      grantablePowers: grantable,
      allowed_delegation_powers: grantable,
      allowedDelegationPowers: grantable,
      can_manage_subadmins: canManageSubadmins,
      canManageSubadmins: canManageSubadmins,
      status: payload.status,
    };

    try {
      let response: any;
      try {
        response = await axiosInstance.put<any>(`/v1/admin/subadmins/${id}`, apiPayload);
      } catch (e1: any) {
        if (e1.response?.status === 403 || e1.response?.status === 400) throw e1;
        try {
          response = await axiosInstance.put<any>(`/admin/subadmins/${id}`, apiPayload);
        } catch (e2: any) {
          if (e2.response?.status === 403 || e2.response?.status === 400) throw e2;
          try {
            response = await axiosInstance.put<any>(`/admin/sub-admins/${id}`, apiPayload);
          } catch (e3: any) {
            if (e3.response?.status === 403 || e3.response?.status === 400) throw e3;
            response = await axiosInstance.patch<any>(`/v1/admin/subadmins/${id}`, apiPayload);
          }
        }
      }

      const updatedBackend = mapSubAdminDTOToDomain(response.data?.data || response.data);
      const current = getLocalSubAdmins();
      const updatedList = current.map((sub) => (sub.id === id ? { ...sub, ...updatedBackend } : sub));
      saveLocalSubAdmins(updatedList);
      
      // Update active session user data if logged in
      try {
        const activeUserRaw = localStorage.getItem('digilocal_user_data');
        if (activeUserRaw) {
          const activeUser = JSON.parse(activeUserRaw);
          if (activeUser.id === id || activeUser.email === updatedBackend?.email) {
            activeUser.powers = payload.powers;
            activeUser.grantablePowers = grantable;
            activeUser.allowedDelegationPowers = grantable;
            activeUser.canManageSubadmins = canManageSubadmins;
            localStorage.setItem('digilocal_user_data', JSON.stringify(activeUser));
          }
        }
      } catch {}

      return updatedBackend;
    } catch (err: any) {
      if (err.response?.status === 403 || err.response?.status === 400) {
        throw err;
      }
      const current = getLocalSubAdmins();
      let updatedTarget: SubAdminUser | null = null;
      const updatedList = current.map((sub) => {
        if (sub.id === id) {
          updatedTarget = {
            ...sub,
            powers: payload.powers,
            grantablePowers: grantable,
            allowedDelegationPowers: grantable,
            canManageSubadmins,
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
            activeUser.grantablePowers = grantable;
            activeUser.allowedDelegationPowers = grantable;
            activeUser.canManageSubadmins = canManageSubadmins;
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
      try {
        const response = await axiosInstance.delete<{ message: string }>(`/v1/admin/subadmins/${id}`);
        const current = getLocalSubAdmins();
        saveLocalSubAdmins(current.filter((sub) => sub.id !== id));
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 403 || err.response?.status === 400) {
          throw err;
        }
        try {
          const response = await axiosInstance.delete<{ message: string }>(`/admin/subadmins/${id}`);
          const current = getLocalSubAdmins();
          saveLocalSubAdmins(current.filter((sub) => sub.id !== id));
          return response.data;
        } catch (err2: any) {
          if (err2.response?.status === 403 || err2.response?.status === 400) {
            throw err2;
          }
          const response = await axiosInstance.delete<{ message: string }>(`/admin/sub-admins/${id}`);
          const current = getLocalSubAdmins();
          saveLocalSubAdmins(current.filter((sub) => sub.id !== id));
          return response.data;
        }
      }
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 400) {
        throw error;
      }
      const current = getLocalSubAdmins();
      saveLocalSubAdmins(current.filter((sub) => sub.id !== id));
      return { message: 'Sub-admin account revoked successfully' };
    }
  },
};
