import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage.utils';
import { authApi } from '../services/api/auth.api';
import type {
  User,
  UserRole,
  AdminLoginRequest,
  VendorLoginRequest,
} from '../types/auth.types';


interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAdmin: (payload: AdminLoginRequest) => Promise<void>;
  loginVendor: (payload: VendorLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage
    const storedRole = (storage.getUserRole() as UserRole) || null;
    const storedToken = storage.getAccessToken() || storage.getAdminToken();
    const storedUser = storage.getUserData<User>();

    // Restore session from localStorage
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
          powers: ['SOCIETIES', 'VENDORS', 'SUBSCRIPTIONS', 'SUPPORT', 'SETTINGS', 'SUB_ADMINS'],
          permissions: ['*'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    }
    setIsLoading(false);
  }, []);

  const loginAdmin = async (payload: AdminLoginRequest) => {
    setIsLoading(true);
    try {
      const email = (payload.email || '').trim().toLowerCase();
      const secret = (payload.admin_secret || '').trim();

      const res = await authApi.loginAdmin({ email, admin_secret: secret });
      const realToken = res.token || res.accessToken;
      const realRefreshToken = res.refreshToken || null;
      const rawRole = String(res.role || res.user?.role || '').toLowerCase();

      const isSubAdmin =
        rawRole.includes('society') ||
        rawRole.includes('sub') ||
        email.includes('priya') ||
        email.includes('sub') ||
        email.includes('vikram');
      const userRole: UserRole = isSubAdmin ? 'sub_admin' : 'super_admin';
      const authToken = realToken || `jwt-admin-token-${Date.now()}`;

      storage.setAdminToken(authToken);
      storage.setAccessToken(authToken);
      if (realRefreshToken) {
        storage.setRefreshToken(realRefreshToken);
      }
      storage.setUserRole(userRole);

      const backendPowers = res.user?.powers || res.user?.permissions;
      const powers = isSubAdmin
        ? Array.isArray(backendPowers) && backendPowers.length > 0
          ? backendPowers
          : ['SOCIETIES', 'VENDORS']
        : ['SOCIETIES', 'VENDORS', 'SUBSCRIPTIONS', 'SUPPORT', 'SETTINGS', 'SUB_ADMINS'];

      const fullName = res.user?.name || res.user?.user_name || (isSubAdmin ? 'Priya Sharma' : 'Super Admin');
      const nameParts = fullName.split(' ');

      const adminUser: User = {
        id: String(res.user?.id || (isSubAdmin ? 'sub-1' : 'super-admin-1')),
        email: email || 'admin@digilocal.com',
        firstName: nameParts[0] || (isSubAdmin ? 'Priya' : 'Super'),
        lastName: nameParts.slice(1).join(' ') || (isSubAdmin ? 'Sharma' : 'Admin'),
        role: userRole,
        powers: powers as any,
        permissions: res.user?.permissions || ['*'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.setUserData(adminUser);

      setToken(authToken);
      setRole(userRole);
      setUser(adminUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginVendor = async (payload: VendorLoginRequest) => {
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
  };

  const logout = async () => {
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
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
