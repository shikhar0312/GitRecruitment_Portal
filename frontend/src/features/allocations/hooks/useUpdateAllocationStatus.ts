import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAllocationStatus } from '../../../api/services/allocations.service';
import { queryKeys } from '../../../lib/query-keys';
import { toast } from '../../../store/toastStore';
import { ALLOCATION_STATUS_LABELS, type AllocationStatus } from '../../../lib/status-machine';
import type { UpdateAllocationStatusInput } from '../../../types/allocation.types';

interface UpdateStatusVariables {
  id: string;
  input: UpdateAllocationStatusInput;
}

export function useUpdateAllocationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateStatusVariables) => updateAllocationStatus(id, input),
    onSuccess: (_, { input }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      const label = ALLOCATION_STATUS_LABELS[input.status as AllocationStatus] ?? input.status;
      toast.success(`Moved to ${label}`);
    },
    onError: () => toast.error('Could not update status'),
  });
}

export type { AllocationStatus };
