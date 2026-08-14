import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  AuthResponse,
  LoginCredentials,
  User,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
} from '../../types/auth';

class AuthService extends BaseApiService {
  constructor() {
    super(apiClient, '/auth');
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.post<AuthResponse, LoginCredentials>('/login', credentials);
  }

  public async logout(): Promise<void> {
    return this.post<void>('/logout');
  }

  public async refreshToken(): Promise<{ accessToken: string }> {
    return this.post<{ accessToken: string }>('/refresh');
  }

  public async getCurrentUser(): Promise<User> {
    return this.get<User>('/me');
  }

  public async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    return this.post<ForgotPasswordResponse, ForgotPasswordPayload>('/forgot-password', payload);
  }

  public async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    return this.post<ResetPasswordResponse, ResetPasswordPayload>('/reset-password', payload);
  }

  public async changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    return this.post<ChangePasswordResponse, ChangePasswordPayload>('/change-password', payload);
  }

  public async verifyResetToken(token: string): Promise<{ valid: boolean }> {
    return this.get<{ valid: boolean }>(`/verify-reset-token?token=${encodeURIComponent(token)}`);
  }
}

export const authService = new AuthService();
