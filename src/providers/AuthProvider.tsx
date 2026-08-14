import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { User, UserRole, AdminLoginRequest, VendorLoginRequest } from '../types/auth.types';
import { storage } from '../utils/storage.utils';
import { authApi } from '../services/api/auth.api';

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
    const storedUser = storage.getUserData<User>();

    if (storedToken && storedRole) {
      setRole(storedRole);
      setToken(storedToken);
      setUser(
        storedUser || {
          id: '1',
          email: 'admin@digilocal.com',
          firstName: 'Admin',
          lastName: 'User',
          role: storedRole,
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
      const authToken = res.accessToken || res.token;
      storage.setAdminToken(authToken);
      storage.setAccessToken(authToken);
      storage.setRefreshToken(res.refreshToken);
      storage.setUserRole(res.role || 'admin');

      const adminUser: User = {
        id: '1',
        email: payload.email,
        firstName: 'System',
        lastName: 'Admin',
        role: (res.role as UserRole) || 'admin',
        permissions: ['*'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.setUserData(adminUser);

      setToken(authToken);
      setRole((res.role as UserRole) || 'admin');
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
