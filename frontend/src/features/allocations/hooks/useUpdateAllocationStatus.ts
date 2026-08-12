import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAllocationStatus } from '../../../api/services/allocations.service';
import { queryKeys } from '../../../lib/query-keys';
import type { AllocationStatus } from '../../../lib/status-machine';
import type { UpdateAllocationStatusInput } from '../../../types/allocation.types';

interface UpdateStatusVariables {
  id: string;
  input: UpdateAllocationStatusInput;
}

export function useUpdateAllocationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateStatusVariables) => updateAllocationStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export type { AllocationStatus };
