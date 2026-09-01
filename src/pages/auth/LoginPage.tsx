import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { useAdminLoginMutation } from '../../hooks/useAuthMutations';
import { useAuth } from '../../hooks/useAuth';
import {
  adminSecretLoginSchema,
  type AdminSecretFormValues,
} from '../../utils/validation.schemas';
import { Mail, Key } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const adminLoginMutation = useAdminLoginMutation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/overview', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const adminForm = useForm<AdminSecretFormValues>({
    resolver: zodResolver(adminSecretLoginSchema),
    defaultValues: {
      admin_secret: '',
      email: '',
    },
  });

  const onAdminSubmit = (values: AdminSecretFormValues) => {
    adminLoginMutation.mutate(values);
  };

  return (
    <div className="login-page-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <div className="login-logo-badge overflow-hidden p-1.5 bg-white border border-[#C8A878] shadow-sm">
            <img src="/logo.png" alt="DigiLocal Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="login-title">DigiLocal Portal</h2>
          <p className="login-subtitle">Sign in to access your delegated admin features</p>
        </div>

        <form className="login-form" onSubmit={adminForm.handleSubmit(onAdminSubmit)}>
          {adminLoginMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {adminLoginMutation.error?.message || 'Login failed. Please check credentials and try again.'}
            </div>
          )}
          <Input
            label="Corporate Email Address"
            placeholder="your.email@digilocal.com"
            leftIcon={<Mail size={16} />}
            error={adminForm.formState.errors.email?.message}
            {...adminForm.register('email')}
          />
          <Input
            label="Password / Access Key"
            type="password"
            placeholder="Enter your account password"
            leftIcon={<Key size={16} />}
            error={adminForm.formState.errors.admin_secret?.message}
            {...adminForm.register('admin_secret')}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={adminLoginMutation.isPending}
            className="login-submit-btn"
          >
            Sign In to Portal
          </Button>
        </form>
      </div>
    </div>
  );
};
