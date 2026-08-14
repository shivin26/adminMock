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
import { Mail, Key, ShieldCheck, UserCheck } from 'lucide-react';

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
      admin_secret: 'Password123!',
      email: 'admin@digilocal.com',
    },
  });

  const onAdminSubmit = (values: AdminSecretFormValues) => {
    adminLoginMutation.mutate(values);
  };

  const handleQuickFill = (email: string, pass: string) => {
    adminForm.setValue('email', email, { shouldValidate: true, shouldDirty: true });
    adminForm.setValue('admin_secret', pass, { shouldValidate: true, shouldDirty: true });
    adminLoginMutation.mutate({ email, admin_secret: pass });
  };

  return (
    <div className="login-page-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <div className="login-logo-badge overflow-hidden p-1.5 bg-white border border-[#C4A066] shadow-sm">
            <img src="/logo.png" alt="DigiLocal Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="login-title">DigiLocal Portal</h2>
          <p className="login-subtitle">Sign in to access your delegated admin features</p>
        </div>

        <form className="login-form" onSubmit={adminForm.handleSubmit(onAdminSubmit)}>
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

        <div className="mt-4 pt-4 border-t border-[#E4DCC9] flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#6B7C70] uppercase tracking-wider text-center">
            Quick Test Accounts
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@digilocal.com', 'Password123!')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#18281F] text-[#E6C35C] font-semibold flex items-center gap-1 hover:opacity-90 transition-all"
            >
              <ShieldCheck size={12} /> Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('priya.1786610169462@digilocal.com', 'password')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#EFE8D8] text-[#18281F] font-semibold flex items-center gap-1 hover:bg-[#E4DCC9] transition-all"
            >
              <UserCheck size={12} /> Sub-Admin (Society Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
