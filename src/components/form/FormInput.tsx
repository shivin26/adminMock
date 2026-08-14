import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input, InputProps } from '../ui/Input';
import { FormField } from './FormField';

export interface FormInputProps extends Omit<InputProps, 'name'> {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  description,
  required,
  ...inputProps
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          error={fieldState.error?.message}
          description={description}
          required={required}
        >
          <Input
            {...field}
            {...inputProps}
            value={field.value ?? ''}
            error={fieldState.error?.message}
          />
        </FormField>
      )}
    />
  );
};
