import { useQuery } from '@tanstack/react-query';
import { listAllocations } from '../../../api/services/allocations.service';
import { queryKeys } from '../../../lib/query-keys';
import type { PaginationMeta } from '../../../api/types/api.types';
import type { Allocation } from '../../../types/allocation.types';
import type { AllocationStatus } from '../../../lib/status-machine';

const defaultMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

interface UseAllocationsFilters {
  status: string;
  page: number;
}

interface UseAllocationsResult {
  allocations: Allocation[];
  meta: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
}

export function useAllocations(filters: UseAllocationsFilters): UseAllocationsResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.allocations.list(filters),
    queryFn: () =>
      listAllocations({
        status: filters.status ? (filters.status as AllocationStatus) : undefined,
        page: filters.page,
      }),
  });

  return {
    allocations: data?.data ?? [],
    meta: data?.meta ?? defaultMeta,
    isLoading,
    isError,
  };
}
