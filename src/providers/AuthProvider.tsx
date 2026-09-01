import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { User, UserRole, AdminLoginRequest, VendorLoginRequest } from '../types/auth.types';
import { storage } from '../utils/storage.utils';
import { authApi } from '../services/api/auth.api';
import { getLocalSubAdmins } from '../services/api/subadmins.api';
import type { PowerSection } from '../types/rbac.types';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedRole = (storage.getUserRole() as UserRole) || null;
    const storedToken = storage.getAccessToken() || storage.getAdminToken();
    let storedUser = storage.getUserData<User>();

    if (storedToken && storedRole) {
      if (storedUser && storedRole === 'sub_admin') {
        const subAdmins = getLocalSubAdmins();
        const match = subAdmins.find((s) => s.email.toLowerCase() === storedUser?.email.toLowerCase());
        if (match && Array.isArray(match.powers)) {
          storedUser = { ...storedUser, powers: match.powers };
          storage.setUserData(storedUser);
        }
      }

      setRole(storedRole);
      setToken(storedToken);
      setUser(
        storedUser || {
          id: '1',
          email: 'admin@digilocal.com',
          firstName: 'Admin',
          lastName: 'User',
          role: storedRole,
          powers: storedRole === 'super_admin'
            ? ['SOCIETIES', 'VENDORS', 'SUBSCRIPTIONS', 'SUPPORT', 'SETTINGS', 'SUB_ADMINS']
            : ['SOCIETIES', 'VENDORS'],
          permissions: ['*'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    }
    setIsLoading(false);
  }, []);

  const loginAdmin = useCallback(async (payload: AdminLoginRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.loginAdmin(payload);
      const authToken = res.accessToken || res.token || `jwt-admin-${Date.now()}`;
      storage.setAdminToken(authToken);
      storage.setAccessToken(authToken);
      if (res.refreshToken) {
        storage.setRefreshToken(res.refreshToken);
      }

      const emailLower = (payload.email || '').toLowerCase();
      const rawRole = String(res.role || (res.user as any)?.role || '').toLowerCase();
      const subAdminMatch = getLocalSubAdmins().find((s) => s.email.toLowerCase() === emailLower);

      const isSubAdmin =
        !!subAdminMatch ||
        rawRole.includes('sub') ||
        rawRole.includes('society') ||
        (emailLower !== 'admin@digilocal.com' &&
          emailLower !== 'admin@digilocal.in' &&
          emailLower !== 'superadmin@digilocal.com');

      const userRole: UserRole = isSubAdmin ? 'sub_admin' : 'super_admin';
      storage.setUserRole(userRole);

      let assignedPowers: PowerSection[] = [];

      if (userRole === 'super_admin') {
        assignedPowers = ['SOCIETIES', 'VENDORS', 'SUBSCRIPTIONS', 'SUPPORT', 'SETTINGS', 'SUB_ADMINS'];
      } else {
        const backendPowers = (res as any)?.powers || (res.user as any)?.powers || (res as any)?.power_permissions;
        if (Array.isArray(backendPowers) && backendPowers.length > 0) {
          assignedPowers = backendPowers;
        } else if (subAdminMatch && Array.isArray(subAdminMatch.powers) && subAdminMatch.powers.length > 0) {
          assignedPowers = subAdminMatch.powers;
        } else {
          assignedPowers = ['SOCIETIES', 'VENDORS', 'SUB_ADMINS'];
        }
      }

      const nameParts = (subAdminMatch?.name || (isSubAdmin ? 'Sub Admin' : 'System Admin')).split(' ');
      const firstName = nameParts[0] || (isSubAdmin ? 'Sub' : 'System');
      const lastName = nameParts.slice(1).join(' ') || (isSubAdmin ? 'Admin' : 'Admin');

      const adminUser: User = {
        id: String((res.user as any)?.id || subAdminMatch?.id || (isSubAdmin ? 'sub-aarushi' : '1')),
        email: payload.email,
        firstName,
        lastName,
        role: userRole,
        powers: assignedPowers,
        allowedDelegationPowers: subAdminMatch?.allowedDelegationPowers,
        permissions: ['*'],
        createdAt: subAdminMatch?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.setUserData(adminUser);

      setToken(authToken);
      setRole(userRole);
      setUser(adminUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginVendor = useCallback(async (payload: VendorLoginRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.loginVendor(payload);
      const authToken = res.accessToken;
      storage.setAccessToken(authToken);
      storage.setRefreshToken(res.refreshToken);
      storage.setUserRole('user');

      const vendorUser: User = {
        id: String(res.vendor.vendor_id),
        email: res.vendor.email,
        firstName: res.vendor.vendor_name,
        lastName: `(${res.vendor.store_name})`,
        avatarUrl: res.vendor.logo,
        role: 'user',
        permissions: ['vendor_access'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.setUserData(vendorUser);

      setToken(authToken);
      setRole('user');
      setUser(vendorUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore API errors on logout
    } finally {
      storage.clearAuth();
      setUser(null);
      setRole(null);
      setToken(null);
      window.location.href = '/auth/login';
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token,
        isLoading,
        loginAdmin,
        loginVendor,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
