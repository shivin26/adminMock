import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

export const Page404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-extrabold text-blue-600 dark:text-blue-500 tracking-widest">
          404
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            leftIcon={<Home className="h-4 w-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
