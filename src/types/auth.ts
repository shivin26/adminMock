export type UserRole = 'super_admin' | 'admin' | 'manager' | 'user';

export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'settings:read'
  | 'settings:write'
  | 'analytics:read';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface SessionConfig {
  timeoutMs: number; // Inactivity timeout threshold (e.g. 15 minutes = 900,000 ms)
  warningThresholdMs: number; // Warning modal threshold before timeout (e.g. 2 minutes = 120,000 ms)
}
