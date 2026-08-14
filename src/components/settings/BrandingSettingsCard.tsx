import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import { LogoUploadPreview } from './LogoUploadPreview';
import {
  updateBrandingSchema,
  type UpdateBrandingFormValues,
} from '../../utils/validation.schemas';
import type { PlatformConfig } from '../../types/config.types';
import { Palette, Save, Image as ImageIcon } from 'lucide-react';

export interface BrandingSettingsCardProps {
  config?: PlatformConfig;
  onSubmit: (values: UpdateBrandingFormValues) => void;
  isLoading?: boolean;
}

export const BrandingSettingsCard: React.FC<BrandingSettingsCardProps> = ({
  config,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateBrandingFormValues>({
    resolver: zodResolver(updateBrandingSchema),
    defaultValues: {
      platform_name: 'DigiLocal',
      platform_logo: '/logo.png',
    },
  });

  useEffect(() => {
    if (config) {
      reset({
        platform_name: config.platform_name || 'DigiLocal',
        platform_logo: config.platform_logo || '/logo.png',
      });
    }
  }, [config, reset]);

  const currentLogo = watch('platform_logo');
  const currentName = watch('platform_name');

  return (
    <div className="p-6 bg-white border border-[#E4DCC9] rounded-2xl shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#E4DCC9]">
        <div className="w-10 h-10 rounded-xl bg-[#18281F] text-[#E6C35C] flex items-center justify-center shrink-0">
          <Palette size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#18281F] font-serif">Branding & Platform Identity</h3>
          <p className="text-xs text-[#6B7C70]">Configure platform title and official header logo URL.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Platform Title / Brand Name"
          placeholder="DigiLocal"
          error={errors.platform_name?.message}
          {...register('platform_name')}
        />

        <Input
          label="Platform Logo Image URL"
          placeholder="/logo.png"
          leftIcon={<ImageIcon size={16} />}
          error={errors.platform_logo?.message}
          {...register('platform_logo')}
        />

        {/* Logo Upload & Live Preview */}
        <LogoUploadPreview
          logoUrl={currentLogo}
          platformName={currentName}
          onUrlChange={(newUrl) => setValue('platform_logo', newUrl, { shouldValidate: true })}
        />

        <div className="flex justify-end pt-2 border-t border-[#E4DCC9]">
          <Button type="submit" variant="primary" leftIcon={<Save size={16} />} isLoading={isLoading}>
            Save Branding Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
