import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load data',
  description = 'There was a problem connecting to the server. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-200 bg-red-50/50 dark:border-red-950/60 dark:bg-red-950/20',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
