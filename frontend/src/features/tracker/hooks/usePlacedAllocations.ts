import { useQuery } from '@tanstack/react-query';
import { listAllocations } from '../../../api/services/allocations.service';
import { queryKeys } from '../../../lib/query-keys';
import type { Allocation } from '../../../types/allocation.types';

// Only placed allocations without an existing margin record can have one
// created — the backend enforces this too, but filtering here keeps the
// dropdown from listing deals that are already tracked.
export function usePlacedAllocations() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.allocations.placedList(),
    queryFn: () => listAllocations({ status: 'placed', limit: 100 }),
  });

  return {
    allocations: (data?.data ?? []) as Allocation[],
    isLoading,
  };
}
