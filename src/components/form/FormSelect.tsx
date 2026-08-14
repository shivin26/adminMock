import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormField } from './FormField';
import { cn } from '../../utils/cn';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: string;
  options: SelectOption[];
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  options,
  label,
  description,
  placeholder = 'Select an option',
  required,
  className,
  disabled,
  ...props
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
          <select
            {...field}
            {...props}
            value={field.value ?? ''}
            disabled={disabled}
            className={cn(
              'flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-xs transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-500',
              fieldState.error && 'border-red-500 focus:ring-red-500',
              className
            )}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>
      )}
    />
  );
};
