import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { cn } from '../../utils/cn';

export interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: string;
  label: string;
  description?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  name,
  label,
  description,
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
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id={name}
            {...field}
            {...props}
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
            disabled={disabled}
            className={cn(
              'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer',
              'dark:border-slate-700 dark:bg-slate-900 dark:checked:bg-blue-600 dark:focus:ring-blue-500',
              disabled && 'cursor-not-allowed opacity-50',
              className
            )}
          />
          <div className="grid gap-1 leading-none">
            <label
              htmlFor={name}
              className={cn(
                'text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
            </label>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
            {fieldState.error && (
              <p className="text-xs font-medium text-red-500 dark:text-red-400">
                {fieldState.error.message}
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
};
