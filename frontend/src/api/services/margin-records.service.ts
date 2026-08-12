import apiClient from '../client';
import type { ApiListResponse, ApiSuccessResponse } from '../types/api.types';
import type { MarginRecordListParams, MarginRecord } from '../../types/margin-record.types';
import type {
  CreateMarginRecordFormInput,
  UpdateMarginRecordFormInput,
} from '../../schemas/margin-record.schema';
import {
  toCreateMarginRecordPayload,
  toUpdateMarginRecordPayload,
} from '../../schemas/margin-record.schema';

export async function listMarginRecords(params: MarginRecordListParams = {}) {
  const response = await apiClient.get<ApiListResponse<MarginRecord>>('/tracker', {
    params: {
      page: params.page,
      limit: params.limit,
      payment_status: params.payment_status,
      billing_entity: params.billing_entity,
      customer_id: params.customer_id,
    },
  });
  return response.data;
}

export async function getMarginRecordById(id: string) {
  const response = await apiClient.get<ApiSuccessResponse<MarginRecord>>(`/tracker/${id}`);
  return response.data.data;
}

export async function createMarginRecord(
  values: CreateMarginRecordFormInput,
  reportingCurrency: string
) {
  const payload = toCreateMarginRecordPayload(values, reportingCurrency);
  const response = await apiClient.post<ApiSuccessResponse<MarginRecord>>('/tracker', payload);
  return response.data.data;
}

export async function updateMarginRecord(id: string, values: UpdateMarginRecordFormInput) {
  const payload = toUpdateMarginRecordPayload(values);
  const response = await apiClient.put<ApiSuccessResponse<MarginRecord>>(`/tracker/${id}`, payload);
  return response.data.data;
}
