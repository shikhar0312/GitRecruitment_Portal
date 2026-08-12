import { useMutation, useQueryClient } from '@tanstack/react-query'
import { confirmResumeParsing } from '../../../api/services/resume-parsing.service'
import { queryKeys } from '../../../lib/query-keys'
import type { ResumeReviewFormValues } from '../../../schemas/resume-parsing.schema'

export function useConfirmResume(uploadId: string, onSuccess: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ResumeReviewFormValues) =>
      confirmResumeParsing(uploadId, {
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all })
      onSuccess()
    },
  })
}
