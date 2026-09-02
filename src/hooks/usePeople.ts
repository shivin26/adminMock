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

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => peopleApi.flagPerson(id, reason),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      logBackendMutation('USERS', 'UPDATE', `Issued warning strike to user account #${variables.id}`, `Strikes count: ${res.person.flagsCount}/3. Auto-banned: ${res.wasBanned}`, variables.id);
    },
  });
};

export const useResetPersonStrikes = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => peopleApi.resetStrikes(id),
    onSuccess: (person, id) => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      logBackendMutation('USERS', 'UPDATE', `Reset warning strikes for user account #${id}`, `Strikes count reset to 0. Status: ACTIVE`, id);
      addToast({
        type: 'success',
        title: 'Strikes Reset',
        description: `Strikes count reset to 0 for ${person.name}. Account status is ACTIVE.`,
      });
    },
  });
};
