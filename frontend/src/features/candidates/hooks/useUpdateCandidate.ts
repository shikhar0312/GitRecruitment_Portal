import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCandidate } from '../../../api/services/candidates.service';
import { queryKeys } from '../../../lib/query-keys';
import { toast } from '../../../store/toastStore';
import type { CreateCandidateFormValues } from '../../../schemas/candidate.schema';

export function useUpdateCandidate(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CreateCandidateFormValues }) =>
      updateCandidate(id, values),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.detail(id) });
      toast.success('Candidate updated');
      onSuccess?.();
    },
  });
}
