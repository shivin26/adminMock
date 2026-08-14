export interface PlatformConfig {
  platform_logo: string;
  platform_name: string;
}

export interface ConfigResponse {
  message?: string;
  platform_logo: string;
  platform_name: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
