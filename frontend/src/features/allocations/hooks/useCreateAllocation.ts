import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAllocation } from '../../../api/services/allocations.service';
import { queryKeys } from '../../../lib/query-keys';
import { toast } from '../../../store/toastStore';
import type { CreateAllocationFormValues } from '../../../schemas/allocation.schema';

export function useCreateAllocation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateAllocationFormValues) => createAllocation(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success('Candidate allocated');
      onSuccess?.();
    },
  });
}
