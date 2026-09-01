import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { societiesApi } from '../services/api/societies.api';
import type {
  Society,
  CreateSocietyRequest,
  UpdateSocietyRequest,
} from '../types/society.types';
import { useToast } from '../context/ToastContext';
import { ErrorHandler } from '../services/handlers/errorHandler';
import { CACHE_KEYS } from '../constants/cache.keys';
import { logBackendMutation } from '../services/audit.service';

export const useSocieties = (search?: string) => {
  return useQuery({
    queryKey: CACHE_KEYS.societies.list(search),
    queryFn: () => societiesApi.getSocieties(search),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSociety = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateSocietyRequest) => societiesApi.createSociety(payload),

    onMutate: async (newSocietyPayload) => {
      await queryClient.cancelQueries({ queryKey: CACHE_KEYS.societies.all });
      const previousSocieties = queryClient.getQueryData<Society[]>(CACHE_KEYS.societies.list(''));

      if (previousSocieties) {
        const locStr = newSocietyPayload.location || '';
        const locationParts = locStr ? locStr.split(',').map((s) => s.trim()) : [];
        const optimisticSociety: Society = {
          id: `temp-${Date.now()}`,
          name: newSocietyPayload.society_name,
          code: `SOC-${Math.floor(Math.random() * 10000)}`,
          address: newSocietyPayload.location,
          city: locationParts[locationParts.length - 1] || 'Noida',
          state: locationParts.length > 1 ? locationParts[locationParts.length - 2] : 'UP',
          postalCode: '201301',
          totalVendorsCount: 0,
          status: 'pending', // Requires First-Time Admin Approval
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<Society[]>(CACHE_KEYS.societies.list(''), [
          optimisticSociety,
          ...previousSocieties,
        ]);
      }

      return { previousSocieties };
    },

    onError: (error: unknown, _variables, context) => {
      if (context?.previousSocieties) {
        queryClient.setQueryData(CACHE_KEYS.societies.list(''), context.previousSocieties);
      }
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Registration Failed',
        description: appErr.message,
      });
    },

    onSuccess: (data, variables) => {
      logBackendMutation('SOCIETIES', 'CREATE', `Registered new society enclave "${variables.society_name}"`, `Location: ${variables.location}`, String(data.society_id || ''));
      addToast({
        type: 'success',
        title: 'Society Registered (Pending Approval)',
        description: data.message || 'Society registered successfully. Awaiting Admin Approval.',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.societies.all });
    },
  });
};

export const useEditSociety = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: UpdateSocietyRequest }) =>
      societiesApi.updateSociety(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: CACHE_KEYS.societies.all });
      const previousSocieties = queryClient.getQueryData<Society[]>(CACHE_KEYS.societies.list(''));

      if (previousSocieties) {
        queryClient.setQueryData<Society[]>(
          CACHE_KEYS.societies.list(''),
          previousSocieties.map((s) => {
            if (s.id === String(id)) {
              return {
                ...s,
                name: payload.society_name,
                address: payload.location,
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          })
        );
      }

      return { previousSocieties };
    },

    onError: (error: unknown, _variables, context) => {
      if (context?.previousSocieties) {
        queryClient.setQueryData(CACHE_KEYS.societies.list(''), context.previousSocieties);
      }
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        description: appErr.message,
      });
    },

    onSuccess: (_data, variables) => {
      logBackendMutation('SOCIETIES', 'UPDATE', `Updated society enclave parameters #${variables.id}`, `Updated name or address to ${variables.payload.society_name}`, String(variables.id));
      addToast({
        type: 'success',
        title: 'Society Details Updated',
        description: 'Society parameters updated in registry.',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.societies.all });
    },
  });
};

export const useToggleSocietyStatus = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string | number;
      status: 'active' | 'suspended' | 'pending';
    }) => societiesApi.toggleSocietyStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: CACHE_KEYS.societies.all });
      const previousSocieties = queryClient.getQueryData<Society[]>(CACHE_KEYS.societies.list(''));

      if (previousSocieties) {
        queryClient.setQueryData<Society[]>(
          CACHE_KEYS.societies.list(''),
          previousSocieties.map((s) => (s.id === String(id) ? { ...s, status } : s))
        );
      }

      return { previousSocieties };
    },

    onError: (error: unknown, _variables, context) => {
      if (context?.previousSocieties) {
        queryClient.setQueryData(CACHE_KEYS.societies.list(''), context.previousSocieties);
      }
      const appErr = ErrorHandler.handle(error);
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        description: appErr.message,
      });
    },

    onSuccess: (_data, variables) => {
      const isBlocking = variables.status === 'suspended';
      const isApproving = variables.status === 'active';
      addToast({
        type: isBlocking ? 'warning' : 'success',
        title: isApproving
          ? 'Society Registration Approved'
          : isBlocking
          ? 'Society Enclave Blocked'
          : 'Status Updated',
        description: isApproving
          ? 'Residential society enclave has been approved and activated.'
          : isBlocking
          ? 'Society has been blocked and vendor operations suspended.'
          : 'Society status updated.',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.societies.all });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.vendors.all });
    },
  });
};

export const useSocietyVendors = (societyId?: string | number) => {
  return useQuery({
    queryKey: CACHE_KEYS.societies.vendors(societyId || ''),
    queryFn: () => societiesApi.getSocietyVendors(societyId!),
    enabled: !!societyId,
    staleTime: 2 * 60 * 1000,
  });
};
