export interface AdminProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  avatarUrl?: string;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  senderEmail: string;
  senderName: string;
  encryptionMode: 'tls' | 'ssl' | 'none';
}

export interface TaxSettings {
  defaultTaxRate: number;
  taxRegistrationNumber: string;
  hsnCode: string;
  isTaxEnabled: boolean;
}

export interface SubscriptionPlanConfig {
  freePrice: number;
  proMonthlyPrice: number;
  proAnnualPrice: number;
  enterpriseMonthlyPrice: number;
  enterpriseAnnualPrice: number;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  baseCurrency: string;
  sessionTimeoutMinutes: number;
  maxFileUploadMb: number;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushAlerts: boolean;
  securityAlerts: boolean;
}

export interface BrandingSettings {
  brandName: string;
  tagline: string;
  primaryColor: string;
  logoUrl?: string;
}

export interface PlatformSettings {
  profile: AdminProfileSettings;
  email: EmailSettings;
  tax: TaxSettings;
  plans: SubscriptionPlanConfig;
  system: SystemSettings;
  notifications: NotificationPreferences;
  branding: BrandingSettings;
}
