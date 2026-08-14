import { createContext } from 'react';
import type { User, UserRole, AdminLoginRequest, VendorLoginRequest } from '../types/auth.types';

export interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAdmin: (payload: AdminLoginRequest) => Promise<void>;
  loginVendor: (payload: VendorLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
