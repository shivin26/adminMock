import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../api/services/settings.service';
import {
  PlatformSettings,
  AdminProfileSettings,
  EmailSettings,
  TaxSettings,
  SubscriptionPlanConfig,
  SystemSettings,
  NotificationPreferences,
  BrandingSettings,
} from '../types/settings';
import { ChangePasswordSchemaType } from '../schemas/settings.schema';
import { toast } from '../components/feedback/ToastSystem';

export const SETTINGS_QUERY_KEY = 'platform-settings';

export function usePlatformSettings() {
  return useQuery<PlatformSettings>({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: () => settingsService.getPlatformSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminProfileSettings) => settingsService.updateAdminProfile(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      const previous = queryClient.getQueryData<PlatformSettings>([SETTINGS_QUERY_KEY]);
      if (previous) {
        queryClient.setQueryData<PlatformSettings>([SETTINGS_QUERY_KEY], {
          ...previous,
          profile: payload,
        });
      }
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData([SETTINGS_QUERY_KEY], context.previous);
      toast.error('Profile update failed', error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] }),
    onSuccess: () => toast.success('Profile Saved', 'Admin profile parameters updated.'),
  });
}

export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordSchemaType) => settingsService.changeAdminPassword(payload),
    onSuccess: () => toast.success('Password Changed', 'Your security password has been updated.'),
    onError: (error: Error) => toast.error('Password change failed', error.message),
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EmailSettings) => settingsService.updateEmailSettings(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      const previous = queryClient.getQueryData<PlatformSettings>([SETTINGS_QUERY_KEY]);
      if (previous) {
        queryClient.setQueryData<PlatformSettings>([SETTINGS_QUERY_KEY], {
          ...previous,
          email: payload,
        });
      }
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData([SETTINGS_QUERY_KEY], context.previous);
      toast.error('SMTP configuration failed', error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] }),
    onSuccess: () => toast.success('SMTP Settings Saved', 'Transactional email settings updated.'),
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: () => settingsService.sendTestEmail(),
    onSuccess: () => toast.success('Test Email Sent', 'Dispatched test email via SMTP server.'),
    onError: (error: Error) => toast.error('Test email failed', error.message),
  });
}

export function useUpdateTaxSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaxSettings) => settingsService.updateTaxSettings(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      const previous = queryClient.getQueryData<PlatformSettings>([SETTINGS_QUERY_KEY]);
      if (previous) {
        queryClient.setQueryData<PlatformSettings>([SETTINGS_QUERY_KEY], {
          ...previous,
          tax: payload,
        });
      }
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData([SETTINGS_QUERY_KEY], context.previous);
      toast.error('Tax settings failed', error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] }),
    onSuccess: () => toast.success('Tax Parameters Saved', 'Tax and GST parameters updated.'),
  });
}

export function useUpdateSubscriptionPlans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubscriptionPlanConfig) => settingsService.updateSubscriptionPlans(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      const previous = queryClient.getQueryData<PlatformSettings>([SETTINGS_QUERY_KEY]);
      if (previous) {
        queryClient.setQueryData<PlatformSettings>([SETTINGS_QUERY_KEY], {
          ...previous,
          plans: payload,
        });
      }
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData([SETTINGS_QUERY_KEY], context.previous);
      toast.error('Pricing update failed', error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] }),
    onSuccess: () => toast.success('Subscription Plans Updated', 'Plan pricing tiers updated.'),
  });
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SystemSettings) => settingsService.updateSystemSettings(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      const previous = queryClient.getQueryData<PlatformSettings>([SETTINGS_QUERY_KEY]);
      if (previous) {
        queryClient.setQueryData<PlatformSettings>([SETTINGS_QUERY_KEY], {
          ...previous,
          system: payload,
        });
      }
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData([SETTINGS_QUERY_KEY], context.previous);
      toast.error('System settings failed', error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] }),
    onSuccess: () => toast.success('System Settings Saved', 'System parameters updated.'),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationPreferences) => settingsService.updateNotificationPreferences(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      const previous = queryClient.getQueryData<PlatformSettings>([SETTINGS_QUERY_KEY]);
      if (previous) {
        queryClient.setQueryData<PlatformSettings>([SETTINGS_QUERY_KEY], {
          ...previous,
          notifications: payload,
        });
      }
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData([SETTINGS_QUERY_KEY], context.previous);
      toast.error('Notification settings failed', error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] }),
    onSuccess: () => toast.success('Preferences Saved', 'Notification channels updated.'),
  });
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BrandingSettings) => settingsService.updateBranding(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      const previous = queryClient.getQueryData<PlatformSettings>([SETTINGS_QUERY_KEY]);
      if (previous) {
        queryClient.setQueryData<PlatformSettings>([SETTINGS_QUERY_KEY], {
          ...previous,
          branding: payload,
        });
      }
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData([SETTINGS_QUERY_KEY], context.previous);
      toast.error('Branding update failed', error.message);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] }),
    onSuccess: () => toast.success('Branding Saved', 'Platform brand & logo parameters updated.'),
  });
}
