import { QueryClient } from '@tanstack/react-query';
import { ENV } from '../../constants/env.constants';

export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ENV.QUERY_STALE_TIME_MS,
        gcTime: ENV.QUERY_CACHE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Do not retry on 401, 403, or 404
          const status = error?.response?.status;
          if (status === 401 || status === 403 || status === 404) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });
};

export const queryClient = createQueryClient();
