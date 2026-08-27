import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRequirement } from '../../../api/services/requirements.service';
import { queryKeys } from '../../../lib/query-keys';
import { toast } from '../../../store/toastStore';
import type { CreateRequirementFormValues } from '../../../schemas/requirement.schema';

export function useCreateRequirement(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateRequirementFormValues) => createRequirement(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requirements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success('Requirement created');
      onSuccess?.();
    },
  });
}
