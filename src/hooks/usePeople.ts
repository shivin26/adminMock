import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { peopleApi } from '../services/api/people.api';
import type {
  CreatePersonRequest,
  PeopleFilterOptions,
  PersonStatus,
} from '../types/people.types';

export const usePeopleList = (filters?: PeopleFilterOptions) => {
  return useQuery({
    queryKey: ['people', 'list', filters],
    queryFn: () => peopleApi.getPeople(filters),
    staleTime: 30000,
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
    staleTime: 60000,
  });
};

export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonRequest) => peopleApi.createPerson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};

export const useUpdatePersonStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PersonStatus }) =>
      peopleApi.updatePersonStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};

export const useFlagPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => peopleApi.flagPerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
};
