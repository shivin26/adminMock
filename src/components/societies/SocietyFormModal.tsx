import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../common/Modal/Modal';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import {
  createSocietySchema,
  type CreateSocietyFormValues,
} from '../../utils/validation.schemas';
import type { Society } from '../../types/society.types';

export interface SocietyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSocietyFormValues) => void;
  isLoading?: boolean;
  initialData?: Society | null;
}

export const SocietyFormModal: React.FC<SocietyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
}) => {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSocietyFormValues>({
    resolver: zodResolver(createSocietySchema),
    defaultValues: {
      name: '',
      city: 'Noida',
      state: 'Uttar Pradesh',
      address: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        city: initialData.city,
        state: initialData.state,
        address: initialData.address,
      });
    } else {
      reset({
        name: '',
        city: 'Noida',
        state: 'Uttar Pradesh',
        address: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Society Details' : 'Register New Society'}
      subtitle={
        isEditing
          ? `Updating records for Code: ${initialData.code}`
          : 'Add a new residential enclave to the DigiLocal platform registry.'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Society Name"
          placeholder="e.g. Royal Garden Enclave"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            placeholder="e.g. Pune"
            error={errors.city?.message}
            {...register('city')}
          />
          <Input
            label="State"
            placeholder="e.g. Maharashtra"
            error={errors.state?.message}
            {...register('state')}
          />
        </div>
        <Input
          label="Full Address / Location"
          placeholder="e.g. Viman Nagar, Sector 4"
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Confirm Registration'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
