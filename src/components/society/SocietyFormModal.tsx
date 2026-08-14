import React from 'react';
import { Building2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Form } from '../form/Form';
import { FormInput } from '../form/FormInput';
import { Button } from '../ui/Button';
import { societySchema, SocietySchemaType } from '../../schemas/society.schema';
import { Society } from '../../types/society';
import { useCreateSociety, useUpdateSociety } from '../../hooks/useSociety';

export interface SocietyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  societyToEdit?: Society | null;
}

export const SocietyFormModal: React.FC<SocietyFormModalProps> = ({
  isOpen,
  onClose,
  societyToEdit,
}) => {
  const createMutation = useCreateSociety();
  const updateMutation = useUpdateSociety();
  const isEditing = Boolean(societyToEdit);

  const defaultValues: Partial<SocietySchemaType> = {
    name: societyToEdit?.name || '',
    code: societyToEdit?.code || '',
    city: societyToEdit?.city || '',
    state: societyToEdit?.state || '',
    postalCode: societyToEdit?.postalCode || '',
    address: societyToEdit?.address || '',
  };

  const handleSubmit = async (values: SocietySchemaType) => {
    try {
      if (isEditing && societyToEdit) {
        await updateMutation.mutateAsync({ id: societyToEdit.id, payload: values });
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
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[var(--gold)]" />
          <span>{isEditing ? 'Edit Society Details' : 'Register New Society'}</span>
        </div>
      }
      description={
        isEditing
          ? `Modify configuration for ${societyToEdit?.name}`
          : 'Enter official society details to onboard a new residential community.'
      }
    >
      <Form
        schema={societySchema}
        onSubmit={handleSubmit}
        options={{ defaultValues }}
        key={societyToEdit?.id || 'new'}
      >
        {() => (
          <div className="space-y-4 pt-2 font-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="name"
                label="Society Name"
                placeholder="Greenwood Heights Society"
                required
              />
              <FormInput
                name="code"
                label="Society Code"
                placeholder="SOC-GWH-01"
                required
                description="Uppercase letters, numbers, or hyphens"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput name="city" label="City" placeholder="Metropolis" required />
              <FormInput name="state" label="State / Province" placeholder="NY" required />
              <FormInput name="postalCode" label="Postal / Zip Code" placeholder="10001" required />
            </div>

            <FormInput
              name="address"
              label="Full Street Address"
              placeholder="450 Greenwood Ave, Building A"
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
                {isEditing ? 'Save Changes' : 'Create Society'}
              </Button>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};
