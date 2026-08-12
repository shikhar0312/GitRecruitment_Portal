import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recalculateMatchScore } from '../../../api/services/allocations.service';
import { queryKeys } from '../../../lib/query-keys';

export function useRecalculateMatchScore(allocationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recalculateMatchScore(allocationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
    },
  });
}
