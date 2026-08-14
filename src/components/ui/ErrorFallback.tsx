import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Typography } from './Typography';
import { Button } from '../common/Button/Button';

export interface ErrorFallbackProps {
  error?: Error | null;
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  title = 'An Unexpected Error Occurred',
  description,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl">
      <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
        <AlertOctagon size={28} />
      </div>
      <Typography variant="h3" className="mb-2">
        {title}
      </Typography>
      <Typography variant="body" className="max-w-md text-slate-400 mb-6">
        {description || error?.message || 'Something went wrong while rendering this component.'}
      </Typography>
      {resetErrorBoundary && (
        <Button variant="primary" leftIcon={<RefreshCw size={16} />} onClick={resetErrorBoundary}>
          Try Again
        </Button>
      )}
    </div>
  );
};
