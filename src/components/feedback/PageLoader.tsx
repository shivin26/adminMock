import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading Digi Local...' }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="flex flex-col items-center space-y-4">
        {/* Brand Logo Accent */}
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/25 animate-pulse">
          DL
        </div>
        <LoadingSpinner size="lg" label={message} />
      </div>
    </div>
  );
};
