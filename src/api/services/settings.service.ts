import { BaseApiService } from './base.service';
import { apiClient } from '../client';
import {
  PlatformSettings,
  AdminProfileSettings,
  EmailSettings,
  TaxSettings,
  SubscriptionPlanConfig,
  SystemSettings,
  NotificationPreferences,
  BrandingSettings,
} from '../../types/settings';
import { ChangePasswordSchemaType } from '../../schemas/settings.schema';
import { env } from '../../env';

// Mock Platform Settings Data
let MOCK_SETTINGS: PlatformSettings = {
  profile: {
    fullName: 'Alex Vance',
    email: 'alex.vance@digilocal.com',
    phone: '+1 (555) 901-2345',
    designation: 'Senior System Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
  },
  email: {
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpUser: 'apikey_digilocal',
    senderEmail: 'noreply@digilocal.com',
    senderName: 'DigiLocal Platform',
    encryptionMode: 'tls',
  },
  tax: {
    defaultTaxRate: 18.0,
    taxRegistrationNumber: '22AAAAA0000A1Z5',
    hsnCode: '998314',
    isTaxEnabled: true,
  },
  plans: {
    freePrice: 0,
    proMonthlyPrice: 49,
    proAnnualPrice: 490,
    enterpriseMonthlyPrice: 199,
    enterpriseAnnualPrice: 1990,
  },
  system: {
    maintenanceMode: false,
    baseCurrency: 'USD',
    sessionTimeoutMinutes: 30,
    maxFileUploadMb: 10,
  },
  notifications: {
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    securityAlerts: true,
  },
  branding: {
    brandName: 'DigiLocal',
    tagline: 'Enterprise Hyperlocal Merchant Platform',
    primaryColor: '#224636',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80',
  },
};

class SettingsService extends BaseApiService {
  constructor() {
    super(apiClient, '/settings');
  }

  public async getPlatformSettings(): Promise<PlatformSettings> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_SETTINGS;
    }
    return this.get<PlatformSettings>('');
  }

  public async updateAdminProfile(payload: AdminProfileSettings): Promise<AdminProfileSettings> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      MOCK_SETTINGS = { ...MOCK_SETTINGS, profile: payload };
      return payload;
    }
    return this.put<AdminProfileSettings, AdminProfileSettings>('/profile', payload);
  }

  public async changeAdminPassword(payload: ChangePasswordSchemaType): Promise<void> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 500));
      if (payload.currentPassword !== 'admin123' && payload.currentPassword !== 'password') {
        throw new Error('Current password is incorrect');
      }
      return;
    }
    return this.post<void, ChangePasswordSchemaType>('/change-password', payload);
  }

  public async updateEmailSettings(payload: EmailSettings): Promise<EmailSettings> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      MOCK_SETTINGS = { ...MOCK_SETTINGS, email: payload };
      return payload;
    }
    return this.put<EmailSettings, EmailSettings>('/email', payload);
  }

  public async sendTestEmail(): Promise<void> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      return;
    }
    return this.post<void, {}>('/email/send-test', {});
  }

  public async updateTaxSettings(payload: TaxSettings): Promise<TaxSettings> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      MOCK_SETTINGS = { ...MOCK_SETTINGS, tax: payload };
      return payload;
    }
    return this.put<TaxSettings, TaxSettings>('/tax', payload);
  }

  public async updateSubscriptionPlans(payload: SubscriptionPlanConfig): Promise<SubscriptionPlanConfig> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      MOCK_SETTINGS = { ...MOCK_SETTINGS, plans: payload };
      return payload;
    }
    return this.put<SubscriptionPlanConfig, SubscriptionPlanConfig>('/subscription-plans', payload);
  }

  public async updateSystemSettings(payload: SystemSettings): Promise<SystemSettings> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      MOCK_SETTINGS = { ...MOCK_SETTINGS, system: payload };
      return payload;
    }
    return this.put<SystemSettings, SystemSettings>('/system', payload);
  }

  public async updateNotificationPreferences(payload: NotificationPreferences): Promise<NotificationPreferences> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 300));
      MOCK_SETTINGS = { ...MOCK_SETTINGS, notifications: payload };
      return payload;
    }
    return this.put<NotificationPreferences, NotificationPreferences>('/notifications', payload);
  }

  public async updateBranding(payload: BrandingSettings): Promise<BrandingSettings> {
    if (env.VITE_ENABLE_MOCK_API) {
      await new Promise((res) => setTimeout(res, 400));
      MOCK_SETTINGS = { ...MOCK_SETTINGS, branding: payload };
      return payload;
    }
    return this.put<BrandingSettings, BrandingSettings>('/branding', payload);
  }
}

export const settingsService = new SettingsService();
