import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../api/services/auth.service';
import { useAuth } from '../useAuth';
import { toast } from '../../components/feedback/ToastSystem';
import { env } from '../../env';
import {
  LoginCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from '../../types/auth';

export const AUTH_QUERY_KEY = ['auth', 'user'];

export function useLogin() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await login(credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      toast.success('Welcome back!', 'Successfully authenticated into DigiLocal Admin.');
    },
    onError: (error: Error) => {
      toast.error('Authentication failed', error.message || 'Please check your email and password.');
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.info('Logged out', 'You have been safely logged out.');
    },
    onError: (error: Error) => {
      toast.error('Logout error', error.message);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      if (env.VITE_ENABLE_MOCK_API) {
        await new Promise((res) => setTimeout(res, 800));
        return { message: 'Password reset link sent to your email.' };
      }
      return authService.forgotPassword(payload);
    },
    onSuccess: () => {
      toast.success(
        'Reset link dispatched',
        'If an account exists with that email, instructions have been sent.'
      );
    },
    onError: (error: Error) => {
      toast.error('Request failed', error.message || 'Unable to process password reset request.');
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      if (env.VITE_ENABLE_MOCK_API) {
        await new Promise((res) => setTimeout(res, 800));
        return { message: 'Password successfully updated.' };
      }
      return authService.resetPassword(payload);
    },
    onSuccess: () => {
      toast.success('Password updated', 'Your password has been reset successfully. Please log in.');
    },
    onError: (error: Error) => {
      toast.error('Reset failed', error.message || 'Invalid or expired password reset token.');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      if (env.VITE_ENABLE_MOCK_API) {
        await new Promise((res) => setTimeout(res, 800));
        return { message: 'Password successfully changed.' };
      }
      return authService.changePassword(payload);
    },
    onSuccess: () => {
      toast.success('Password updated', 'Your password has been changed successfully.');
    },
    onError: (error: Error) => {
      toast.error('Update failed', error.message || 'Could not change password.');
    },
  });
}
