import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { peopleApi } from '../services/api/people.api';
import type {
  CreatePersonRequest,
  PeopleFilterOptions,
  PersonStatus,
} from '../types/people.types';

import { useToast } from '../context/ToastContext';
import { logBackendMutation } from '../services/audit.service';

export const usePeopleList = (filters?: PeopleFilterOptions) => {
  return useQuery({
    queryKey: ['people', 'list', filters],
    queryFn: () => peopleApi.getPeople(filters),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const usePersonDetails = (id?: string | null) => {
  return useQuery({
    queryKey: ['people', 'detail', id],
    queryFn: () => peopleApi.getPersonById(id!),
    enabled: Boolean(id),
  });
};

export const usePeopleAnalytics = () => {
  return useQuery({
    queryKey: ['people', 'analytics'],
    queryFn: () => peopleApi.getPeopleAnalytics(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

export const useCreatePerson = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePersonRequest) => peopleApi.createPerson(data),
    onSuccess: (newPerson, variables) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      logBackendMutation('USERS', 'CREATE', `Created user account "${variables.fullName}" (${variables.email})`, `Assigned role: ${variables.role || 'USER'}`, String(newPerson?.id || ''));
      addToast({
        type: 'success',
        title: 'User Account Created',
        description: `Created account for ${variables.fullName}.`,
      });
    },
  });
};

export const useUpdatePersonStatus = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PersonStatus }) =>
      peopleApi.updatePersonStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      logBackendMutation('USERS', 'STATUS_CHANGE', `Updated status for user #${variables.id}`, `Changed status to ${variables.status.toUpperCase()}`, variables.id);
      addToast({
        type: 'success',
        title: 'User Status Updated',
        description: `User #${variables.id} status updated to ${variables.status.toUpperCase()}.`,
      });
    },
  });
};

export const useFlagPerson = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => peopleApi.flagPerson(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      logBackendMutation('USERS', 'UPDATE', `Flagged user account #${id}`, 'User flagged for administrative review.', id);
      addToast({
        type: 'warning',
        title: 'User Flagged',
        description: `User account #${id} flagged for review.`,
      });
    },
  });
};
