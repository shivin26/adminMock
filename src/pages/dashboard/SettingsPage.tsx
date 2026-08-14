import React from 'react';
import './SettingsPage.css';
import { PageHeader } from '../../components/layout/PageHeader/PageHeader';
import { BrandingSettingsCard } from '../../components/settings/BrandingSettingsCard';
import { PasswordSettingsCard } from '../../components/settings/PasswordSettingsCard';
import {
  usePlatformConfig,
  useUpdatePlatformConfig,
  useChangePassword,
} from '../../hooks/useConfig';
import type {
  UpdateBrandingFormValues,
  ChangePasswordFormValues,
} from '../../utils/validation.schemas';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const SettingsPage: React.FC = () => {
  const { data: config, isLoading: isLoadingConfig } = usePlatformConfig();
  const updateConfigMutation = useUpdatePlatformConfig();
  const changePasswordMutation = useChangePassword();

  const handleBrandingSubmit = (values: UpdateBrandingFormValues) => {
    updateConfigMutation.mutate(values);
  };

  const handlePasswordSubmit = (values: ChangePasswordFormValues) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <div className="settings-page">
      <PageHeader
        title="Platform Settings"
        description="Configure enterprise branding, platform logo, and administrative security."
      />

      <div className="settings-grid">
        {isLoadingConfig ? (
          <div className="p-6 bg-slate-900/60 border border-slate-700/50 rounded-xl flex flex-col gap-4">
            <LoadingSkeleton width={180} height={24} />
            <LoadingSkeleton width="100%" height={40} />
            <LoadingSkeleton width="100%" height={40} />
            <LoadingSkeleton width="100%" height={120} />
          </div>
        ) : (
          <BrandingSettingsCard
            config={config}
            onSubmit={handleBrandingSubmit}
            isLoading={updateConfigMutation.isPending}
          />
        )}

        <PasswordSettingsCard
          onSubmit={handlePasswordSubmit}
          isLoading={changePasswordMutation.isPending}
        />
      </div>
    </div>
  );
};
