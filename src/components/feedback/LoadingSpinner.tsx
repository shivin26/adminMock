import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <Loader2 className={cn('animate-spin text-blue-600 dark:text-blue-400', sizes[size], className)} />
      {label && <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
};
