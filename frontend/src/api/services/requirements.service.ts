import apiClient from '../client';
import type { ApiListResponse, ApiSuccessResponse } from '../types/api.types';
import type { Requirement, RequirementListParams, SuggestedCandidate } from '../../types/requirement.types';
import type { CreateRequirementFormValues } from '../../schemas/requirement.schema';
import { toCreateRequirementPayload } from '../../schemas/requirement.schema';

export async function listRequirements(params: RequirementListParams = {}) {
  const response = await apiClient.get<ApiListResponse<Requirement>>('/requirements', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status,
      hiring_type: params.hiring_type,
      work_mode: params.work_mode,
      priority: params.priority,
      billing_entity: params.billing_entity,
      customer_id: params.customer_id,
      role_id: params.role_id,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
  });
  return response.data;
}

export async function getRequirementById(id: string) {
  const response = await apiClient.get<ApiSuccessResponse<Requirement>>(`/requirements/${id}`);
  return response.data.data;
}

export async function createRequirement(values: CreateRequirementFormValues) {
  const payload = toCreateRequirementPayload(values);
  const response = await apiClient.post<ApiSuccessResponse<Requirement>>('/requirements', payload);
  return response.data.data;
}

export async function getSuggestedCandidates(requirementId: string, page = 1, limit = 10) {
  const response = await apiClient.get<ApiListResponse<SuggestedCandidate>>(
    `/requirements/${requirementId}/suggested-candidates`,
    { params: { page, limit } }
  );
  return response.data;
}

export async function updateRequirement(id: string, values: CreateRequirementFormValues) {
  const payload = toCreateRequirementPayload(values);
  const response = await apiClient.put<ApiSuccessResponse<Requirement>>(`/requirements/${id}`, payload);
  return response.data.data;
}

export async function deleteRequirement(id: string) {
  await apiClient.delete(`/requirements/${id}`);
}
