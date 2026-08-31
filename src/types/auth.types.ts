export type UserRole = 'super_admin' | 'sub_admin' | 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  powers?: string[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VendorUser {
  vendor_id: number;
  society_id: number;
  vendor_name: string;
  email: string;
  store_name: string;
  logo: string;
  status: string;
}

// Request Bodies strictly from backend specification
export interface AdminLoginRequest {
  admin_secret: string;
  email: string;
}

export interface VendorLoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Response Bodies strictly from backend specification
export interface AdminLoginResponse {
  message: string;
  role: string;
  token: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface VendorLoginResponse {
  message: string;
  vendor: VendorUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
  token?: string;
}

export interface LogoutResponse {
  message: string;
}
