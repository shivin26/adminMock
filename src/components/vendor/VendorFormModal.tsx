import React from 'react';
import { Store } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { FormSelect } from '../form/FormSelect';
import { Button } from '../ui/Button';
import { vendorSchema, VendorSchemaType } from '../../schemas/vendor.schema';
import { Vendor } from '../../types/vendor';
import { useCreateVendor, useUpdateVendor } from '../../hooks/useVendor';

export interface VendorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorToEdit?: Vendor | null;
}

export const VendorFormModal: React.FC<VendorFormModalProps> = ({
  isOpen,
  onClose,
  vendorToEdit,
}) => {
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const isEditing = Boolean(vendorToEdit);

  const defaultValues: Partial<VendorSchemaType> = {
    storeName: vendorToEdit?.storeName || '',
    ownerName: vendorToEdit?.ownerName || '',
    category: vendorToEdit?.category || 'Grocery',
    email: vendorToEdit?.email || '',
    phone: vendorToEdit?.phone || '',
    website: vendorToEdit?.website || '',
    address: vendorToEdit?.address || '',
    societyName: vendorToEdit?.societyName || 'Greenwood Heights Society',
    gstin: vendorToEdit?.gstin || '',
    businessType: vendorToEdit?.businessType || 'Private Limited',
    subscriptionTier: vendorToEdit?.subscriptionTier || 'pro',
  };

  const handleSubmit = async (values: VendorSchemaType) => {
    try {
      if (isEditing && vendorToEdit) {
        await updateMutation.mutateAsync({ id: vendorToEdit.id, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-[var(--gold)]" />
          <span>{isEditing ? 'Edit Vendor Profile' : 'Onboard New Vendor'}</span>
        </div>
      }
      description={
        isEditing
          ? `Update profile and business parameters for ${vendorToEdit?.storeName}`
          : 'Enter official business details, GSTIN, and subscription plan to onboard a new vendor.'
      }
    >
      <Form
        schema={vendorSchema}
        onSubmit={handleSubmit}
        options={{ defaultValues }}
        key={vendorToEdit?.id || 'new'}
      >
        {() => (
          <div className="space-y-4 pt-2 font-body">
            {/* Basic Store Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="storeName"
                label="Store / Business Name"
                placeholder="Artisan Bakery Co."
                required
              />
              <FormInput
                name="ownerName"
                label="Owner / Representative Name"
                placeholder="Claire Vance"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormSelect
                name="category"
                label="Vendor Category"
                required
                options={[
                  { label: 'Grocery', value: 'Grocery' },
                  { label: 'Bakery & Food', value: 'Bakery & Food' },
                  { label: 'Home & Living', value: 'Home & Living' },
                  { label: 'Florist & Decor', value: 'Florist & Decor' },
                  { label: 'Sports & Adventure', value: 'Sports & Adventure' },
                ]}
              />
              <FormInput
                name="email"
                label="Contact Email"
                placeholder="owner@store.com"
                type="email"
                required
              />
              <FormInput
                name="phone"
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            {/* GST Details & Registration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--border)] pt-4">
              <FormInput
                name="gstin"
                label="GSTIN (15 Alphanumeric)"
                placeholder="22ABCDE1234F1Z5"
                required
                description="Valid 15-digit GSTIN number"
              />
              <FormSelect
                name="businessType"
                label="Business Entity Type"
                required
                options={[
                  { label: 'Sole Proprietorship', value: 'Sole Proprietorship' },
                  { label: 'Partnership', value: 'Partnership' },
                  { label: 'LLP', value: 'LLP' },
                  { label: 'Private Limited', value: 'Private Limited' },
                ]}
              />
              <FormSelect
                name="subscriptionTier"
                label="Subscription Status"
                required
                options={[
                  { label: 'Active Subscription', value: 'subscribed' },
                  { label: 'Not Subscribed', value: 'unsubscribed' },
                ]}
              />
            </div>

            {/* Society & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="societyName"
                label="Allocated Society"
                placeholder="Greenwood Heights Society"
                required
              />
              <FormInput
                name="website"
                label="Website URL (Optional)"
                placeholder="https://vendorstore.com"
              />
            </div>

            <FormInput
              name="address"
              label="Store Street Address"
              placeholder="Shop 4, Main Commercial Complex"
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)] mt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? 'Save Changes' : 'Onboard Vendor'}
              </Button>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};
