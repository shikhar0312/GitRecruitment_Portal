import apiClient from '../client';
import type { ApiListResponse, ApiSuccessResponse } from '../types/api.types';
import type {
  Allocation,
  AllocationListParams,
  UpdateAllocationStatusInput,
  CreateInterviewRoundInput,
  InterviewRound,
} from '../../types/allocation.types';
import type { CreateAllocationFormValues } from '../../schemas/allocation.schema';
import { toCreateAllocationPayload } from '../../schemas/allocation.schema';

export async function listAllocations(params: AllocationListParams = {}) {
  const response = await apiClient.get<ApiListResponse<Allocation>>('/allocations', {
    params: {
      page: params.page,
      limit: params.limit,
      status: params.status,
      customer_id: params.customer_id,
      candidate_id: params.candidate_id,
      requirement_id: params.requirement_id,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
  });
  return response.data;
}

export async function getAllocationById(id: string) {
  const response = await apiClient.get<ApiSuccessResponse<Allocation>>(`/allocations/${id}`);
  return response.data.data;
}

export async function createAllocation(values: CreateAllocationFormValues) {
  const payload = toCreateAllocationPayload(values);
  const response = await apiClient.post<ApiSuccessResponse<Allocation>>('/allocations', payload);
  return response.data.data;
}

export async function updateAllocationStatus(
  id: string,
  input: UpdateAllocationStatusInput
) {
  const response = await apiClient.patch<ApiSuccessResponse<Allocation>>(
    `/allocations/${id}/status`,
    input
  );
  return response.data.data;
}

export async function recalculateMatchScore(id: string) {
  const response = await apiClient.post<ApiSuccessResponse<Allocation>>(
    `/allocations/${id}/recalculate-score`
  );
  return response.data.data;
}

export async function addInterviewRound(allocationId: string, input: CreateInterviewRoundInput) {
  const response = await apiClient.post<ApiSuccessResponse<InterviewRound>>(
    `/allocations/${allocationId}/interviews`,
    input
  );
  return response.data.data;
}

export async function updateInterviewRound(
  allocationId: string,
  roundId: string,
  input: Partial<CreateInterviewRoundInput>
) {
  const response = await apiClient.patch<ApiSuccessResponse<InterviewRound>>(
    `/allocations/${allocationId}/interviews/${roundId}`,
    input
  );
  return response.data.data;
}

export async function deleteInterviewRound(allocationId: string, roundId: string) {
  const response = await apiClient.delete<ApiSuccessResponse<{ success: boolean }>>(
    `/allocations/${allocationId}/interviews/${roundId}`
  );
  return response.data.data;
}
