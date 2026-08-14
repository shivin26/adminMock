import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export const Page500: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-extrabold text-red-600 dark:text-red-500 tracking-widest">
          500
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Internal Server Error
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Something went wrong on our end. Please try refreshing the page or try again later.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          <Button
            leftIcon={<Home className="h-4 w-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};
