import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addCandidateSkill,
  createCandidate,
} from '../../../api/services/candidates.service';
import { queryKeys } from '../../../lib/query-keys';
import { toast } from '../../../store/toastStore';
import {
  parseSkillsList,
  type CreateCandidateFormValues,
} from '../../../schemas/candidate.schema';

export function useCreateCandidate(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateCandidateFormValues) => {
      const { skills, ...formValues } = values;
      const candidate = await createCandidate({ ...formValues, skills });

      const skillsList = parseSkillsList(skills);
      for (const skill of skillsList) {
        await addCandidateSkill(candidate.id, {
          skill,
          is_primary: true,
          proficiency: 'intermediate',
        });
      }

      return candidate;
    },
    onSuccess: (candidate) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success(`${candidate.full_name} added to candidates`);
      onSuccess?.();
    },
  });
}
