import apiClient from '../client';
import type { ApiListResponse, ApiSuccessResponse } from '../types/api.types';
import type { Role, RoleListParams } from '../../types/role.types';
import type { RoleFormValues } from '../../schemas/role.schema';
import { toRolePayload } from '../../schemas/role.schema';

export async function listRoles(params: RoleListParams = {}) {
  const response = await apiClient.get<ApiListResponse<Role>>('/roles', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      category: params.category,
    },
  });
  return response.data;
}

export async function getRoleById(id: string) {
  const response = await apiClient.get<ApiSuccessResponse<Role>>(`/roles/${id}`);
  return response.data.data;
}

export async function createRole(values: RoleFormValues) {
  const payload = toRolePayload(values);
  const response = await apiClient.post<ApiSuccessResponse<Role>>('/roles', payload);
  return response.data.data;
}

export async function updateRole(id: string, values: RoleFormValues) {
  const payload = toRolePayload(values);
  const response = await apiClient.put<ApiSuccessResponse<Role>>(`/roles/${id}`, payload);
  return response.data.data;
}

export async function deleteRole(id: string) {
  await apiClient.delete(`/roles/${id}`);
}
