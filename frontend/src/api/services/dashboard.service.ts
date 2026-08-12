import apiClient from '../client';
import type { ApiSuccessResponse } from '../types/api.types';
import type { DashboardAggregates } from '../../types/dashboard.types';

export async function getDashboardAggregates() {
  const response = await apiClient.get<ApiSuccessResponse<DashboardAggregates>>('/dashboard/');
  return response.data.data;
}
