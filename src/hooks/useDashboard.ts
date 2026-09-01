import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardData } from '../api/services/dashboard.service';

export const DASHBOARD_QUERY_KEY = ['dashboard', 'overview'];

export function useDashboardData() {
  return useQuery<DashboardData>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => dashboardService.getDashboardData(),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}
