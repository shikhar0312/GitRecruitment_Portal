import { useMutation } from '@tanstack/react-query'
import { uploadResume } from '../../../api/services/resume-parsing.service'

export function useResumeUpload() {
  return useMutation({
    mutationFn: (file: File) => uploadResume(file),
  })
}
