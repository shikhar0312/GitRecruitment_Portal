import { useQuery } from '@tanstack/react-query';
import { getAllocationById } from '../../../api/services/allocations.service';
import { queryKeys } from '../../../lib/query-keys';

export function useAllocationDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.allocations.detail(id ?? ''),
    queryFn: () => getAllocationById(id!),
    enabled: Boolean(id),
  });
}
