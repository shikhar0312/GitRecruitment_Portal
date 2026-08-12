import { useQuery } from '@tanstack/react-query';
import { getDashboardAggregates } from '../../../api/services/dashboard.service';
import { queryKeys } from '../../../lib/query-keys';
import type { DashboardAggregates } from '../../../types/dashboard.types';

export function useDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.dashboard.aggregates(),
    queryFn: getDashboardAggregates,
  });

  return {
    data: data as DashboardAggregates | undefined,
    isLoading,
    isError,
  };
}
