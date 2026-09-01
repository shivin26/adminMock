import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../services/api/config.api';
import type { PlatformConfig, PasswordChangeRequest } from '../types/config.types';
import { useToast } from '../context/ToastContext';
import { ErrorHandler } from '../services/handlers/errorHandler';
import { CACHE_KEYS } from '../constants/cache.keys';

export const usePlatformConfig = () => {
  return useQuery({
    queryKey: CACHE_KEYS.config.main,
    queryFn: () => configApi.getConfig(),
    staleTime: 10 * 60 * 1000,
  });
};

import { logBackendMutation } from '../services/audit.service';

export const useUpdatePlatformConfig = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: PlatformConfig) => configApi.updateConfig(payload),
    onSuccess: (data, payload) => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.config.main });
      logBackendMutation('SETTINGS', 'UPDATE', 'Updated platform branding & logo configuration', `Updated platform title: "${payload.appTitle}"`);
      addToast({
        type: 'success',
        title: 'Branding Settings Updated',
        description: data.message || 'Platform logo and title updated successfully.',
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: appErr.message,
      });
    },
  });
};

export const useChangePassword = () => {
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: PasswordChangeRequest) => configApi.changePassword(payload),
    onSuccess: (data) => {
      logBackendMutation('SETTINGS', 'UPDATE', 'Changed administrator account password', 'Security password successfully updated.');
      addToast({
        type: 'success',
        title: 'Password Updated',
        description: data.message || 'Your administrator password has been changed.',
      });
    },
    onError: (error: unknown) => {
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Password Change Failed',
        description: appErr.message,
      });
    },
  });
};
