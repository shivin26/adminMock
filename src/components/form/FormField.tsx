import React from 'react';
import { cn } from '../../utils/cn';

export interface FormFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  description,
  required,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {error && <p className="text-xs font-medium text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};
