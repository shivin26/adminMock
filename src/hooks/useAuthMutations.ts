import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';
import type { AdminLoginRequest, VendorLoginRequest } from '../types/auth.types';
import { ErrorHandler } from '../services/handlers/errorHandler';

export const useAdminLoginMutation = () => {
  const { loginAdmin } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: AdminLoginRequest) => loginAdmin(payload),
    onSuccess: () => {
      queryClient.clear();
      addToast({
        type: 'success',
        title: 'Authentication Successful',
        description: 'Welcome back to DigiLocal Enterprise Admin.',
      });
      navigate('/dashboard/overview', { replace: true });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Admin Authentication Failed',
        description: appErr.message,
      });
    },
  });
};

export const useVendorLoginMutation = () => {
  const { loginVendor } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: VendorLoginRequest) => loginVendor(payload),
    onSuccess: () => {
      queryClient.clear();
      addToast({
        type: 'success',
        title: 'Sign In Successful',
        description: 'Welcome back to your vendor portal.',
      });
      navigate('/dashboard/overview', { replace: true });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Vendor Login Failed',
        description: appErr.message,
      });
    },
  });
};

export const useLogoutMutation = () => {
  const { logout } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
      addToast({
        type: 'info',
        title: 'Logged Out',
        description: 'Your session tokens have been revoked.',
      });
    },
    onError: () => {
      // Force clear cache and redirect even on network logout error
      queryClient.clear();
    },
  });
};
