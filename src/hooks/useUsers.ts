import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/api/users.api';

export const USER_CACHE_KEYS = {
  all: ['users'] as const,
  detail: (nameOrEmail: string) => ['users', nameOrEmail] as const,
};

export const useUsers = () => {
  return useQuery({
    queryKey: USER_CACHE_KEYS.all,
    queryFn: () => usersApi.getUsers(),
  });
};

export const useUserProfile = (identifier?: string | null) => {
  return useQuery({
    queryKey: USER_CACHE_KEYS.detail(identifier || ''),
    queryFn: () => usersApi.getUserByNameOrEmail(identifier!),
    enabled: Boolean(identifier),
  });
};

export const useFlagUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.flagUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => usersApi.blockUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_CACHE_KEYS.all });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_CACHE_KEYS.all });
    },
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: (userId: string) => usersApi.resetUserPassword(userId),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_CACHE_KEYS.all });
    },
  });
};

export const useResetUserFlags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.resetUserFlags(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_CACHE_KEYS.all });
    },
  });
};

export const useUserAnalytics = () => {
  return useQuery({
    queryKey: ['users', 'analytics'] as const,
    queryFn: () => usersApi.getUserAnalytics(),
  });
};
