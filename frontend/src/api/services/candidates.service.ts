import apiClient from '../client';
import type { ApiListResponse, ApiSuccessResponse } from '../types/api.types';
import type {
  Candidate,
  CandidateListParams,
  CreateSkillInput,
} from '../../types/candidate.types';
import type { CreateCandidateFormValues } from '../../schemas/candidate.schema';
import { toCreateCandidatePayload } from '../../schemas/candidate.schema';

export async function listCandidates(params: CandidateListParams = {}) {
  const response = await apiClient.get<ApiListResponse<Candidate>>('/candidates', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status,
    },
  });
  return response.data;
}

export async function getCandidateById(id: string) {
  const response = await apiClient.get<ApiSuccessResponse<Candidate>>(`/candidates/${id}`);
  return response.data.data;
}

export async function createCandidate(values: CreateCandidateFormValues) {
  const payload = toCreateCandidatePayload(values);
  const response = await apiClient.post<ApiSuccessResponse<Candidate>>('/candidates', payload);
  return response.data.data;
}

export async function addCandidateSkill(candidateId: string, skill: CreateSkillInput) {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(
    `/candidates/${candidateId}/skills`,
    skill
  );
  return response.data.data;
}

export async function updateCandidate(id: string, values: CreateCandidateFormValues) {
  const payload = toCreateCandidatePayload(values);
  const response = await apiClient.put<ApiSuccessResponse<Candidate>>(`/candidates/${id}`, payload);
  return response.data.data;
}

export async function deleteCandidateSkill(candidateId: string, skillId: string) {
  await apiClient.delete(`/candidates/${candidateId}/skills/${skillId}`);
}

export async function addCandidateWorkHistory(
  candidateId: string,
  data: {
    company_name: string;
    role_title: string;
    employment_type: string;
    start_date: string;
    is_current: boolean;
    location?: string;
    end_date?: string;
    responsibilities?: string;
  }
) {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(
    `/candidates/${candidateId}/work-history`,
    data
  );
  return response.data.data;
}

export async function deleteCandidateWorkHistory(candidateId: string, entryId: string) {
  await apiClient.delete(`/candidates/${candidateId}/work-history/${entryId}`);
}

export async function addCandidateEducation(
  candidateId: string,
  data: {
    institution: string;
    degree: string;
    field_of_study?: string;
    start_year?: number;
    end_year?: number;
    is_current?: boolean;
  }
) {
  const response = await apiClient.post<ApiSuccessResponse<unknown>>(
    `/candidates/${candidateId}/education`,
    data
  );
  return response.data.data;
}

export async function deleteCandidateEducation(candidateId: string, entryId: string) {
  await apiClient.delete(`/candidates/${candidateId}/education/${entryId}`);
}
