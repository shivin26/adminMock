import React from 'react';
import { Palette, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { Button } from '../ui/Button';
import { brandingSchema, BrandingSchemaType } from '../../schemas/settings.schema';
import { BrandingSettings } from '../../types/settings';
import { useUpdateBranding } from '../../hooks/useSettings';

export interface BrandingTabProps {
  data?: BrandingSettings;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({ data }) => {
  const updateMutation = useUpdateBranding();

  const defaultValues: Partial<BrandingSchemaType> = {
    brandName: data?.brandName || '',
    tagline: data?.tagline || '',
    primaryColor: data?.primaryColor || '#224636',
    logoUrl: data?.logoUrl || '',
  };

  const handleSubmit = async (values: BrandingSchemaType) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <Card className="p-2 gold-border-hover transition">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-[var(--gold)]" />
          <CardTitle className="text-xl">Branding & Logo Upload</CardTitle>
        </div>
        <CardDescription>CUSTOMIZE PLATFORM IDENTITY, LOGO ASSETS, AND COLOR PALETTE</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={brandingSchema}
          onSubmit={handleSubmit}
          options={{ defaultValues }}
          key={data?.brandName || 'brand'}
        >
          {() => (
            <div className="space-y-6 pt-2 font-body">
              {/* Brand Logo Upload & Preview */}
              <div className="p-4 rounded-md bg-[var(--secondary)] border border-[var(--border)] flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={data?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80'}
                  alt="Brand Logo"
                  className="h-16 w-16 rounded-md object-cover border border-[var(--gold)] shrink-0"
                />
                <div className="flex-1 space-y-1">
                  <h4 className="font-serif font-bold text-base text-[var(--foreground)]">Platform Logo</h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Recommended resolution: 512x512 PNG or SVG format. Max size 2MB.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" leftIcon={<Upload className="h-3.5 w-3.5" />}>
                  Upload New Logo
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput name="brandName" label="Platform Brand Name" placeholder="DigiLocal" required />
                <FormInput name="tagline" label="Brand Tagline / Eyebrow" placeholder="Enterprise Hyperlocal Merchant Platform" required />
                <FormInput name="primaryColor" label="Primary Accent Color (Hex/HSL)" placeholder="#224636" required />
                <FormInput name="logoUrl" label="Logo Image URL (Optional)" placeholder="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" />
              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border)]">
                <Button type="submit" variant="default" isLoading={updateMutation.isPending}>
                  Save Branding Assets
                </Button>
              </div>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
};
