import apiClient from '../client'
import type { ResumeUploadResponse, ResumeUploadRecord, ParsedResumeData } from '../../types/resume-parsing.types'

interface ApiSuccessResponse<T> {
  success: boolean
  data: T
}

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<ApiSuccessResponse<ResumeUploadResponse>>(
    '/resume-parsing/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )
  return response.data.data
}

export async function getResumeUpload(uploadId: string): Promise<ResumeUploadRecord> {
  const response = await apiClient.get<ApiSuccessResponse<ResumeUploadRecord>>(
    `/resume-parsing/${uploadId}`
  )
  return response.data.data
}

export async function confirmResumeParsing(
  uploadId: string,
  data: Omit<ParsedResumeData, 'raw_ocr_text'> & {
    availability_status: string
    status: string
    currency: string
  }
): Promise<any> {
  const response = await apiClient.post<ApiSuccessResponse<any>>(
    `/resume-parsing/${uploadId}/confirm`,
    data
  )
  return response.data.data
}
