import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addCandidateSkill,
  createCandidate,
  uploadCandidateResume,
} from '../../../api/services/candidates.service';
import { queryKeys } from '../../../lib/query-keys';
import { toast } from '../../../store/toastStore';
import {
  parseSkillsList,
  type CreateCandidateFormValues,
} from '../../../schemas/candidate.schema';

// Split-screen add flow: create the candidate from the manually-filled form,
// add primary skills, then attach the uploaded resume file to the new record.
// The resume upload is best-effort — if it fails, the candidate is still
// created, so HR isn't blocked by a file hiccup (we surface a soft warning).
export function useCreateCandidateWithResume(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      values,
      resumeFile,
    }: {
      values: CreateCandidateFormValues;
      resumeFile: File | null;
    }) => {
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

      let resumeAttached = true;
      if (resumeFile) {
        try {
          await uploadCandidateResume(candidate.id, resumeFile);
        } catch {
          resumeAttached = false;
        }
      }

      return { candidate, resumeAttached };
    },
    onSuccess: ({ candidate, resumeAttached }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success(`${candidate.full_name} added to candidates`);
      if (!resumeAttached) {
        toast.error('Candidate saved, but the resume file could not be attached');
      }
      onSuccess?.();
    },
  });
}
