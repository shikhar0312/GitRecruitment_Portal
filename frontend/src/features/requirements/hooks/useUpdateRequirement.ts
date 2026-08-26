import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRequirement } from '../../../api/services/requirements.service';
import { queryKeys } from '../../../lib/query-keys';
import { toast } from '../../../store/toastStore';
import type { CreateRequirementFormValues } from '../../../schemas/requirement.schema';

export function useUpdateRequirement(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CreateRequirementFormValues }) =>
      updateRequirement(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requirements.all });
      toast.success('Requirement updated');
      onSuccess?.();
    },
  });
}
