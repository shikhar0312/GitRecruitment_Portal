import apiClient from '../client';
import type { ApiListResponse, ApiSuccessResponse } from '../types/api.types';
import type {
  Customer,
  CustomerListParams,
  CustomerContact,
} from '../../types/customer.types';
import type { CreateCustomerFormValues, CustomerContactFormValues } from '../../schemas/customer.schema';
import { toCreateCustomerPayload, toCustomerContactPayload } from '../../schemas/customer.schema';

export async function listCustomers(params: CustomerListParams = {}) {
  const response = await apiClient.get<ApiListResponse<Customer>>('/customers', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      status: params.status,
    },
  });
  return response.data;
}

export async function getCustomerById(id: string) {
  const response = await apiClient.get<ApiSuccessResponse<Customer>>(`/customers/${id}`);
  return response.data.data;
}

export async function createCustomer(values: CreateCustomerFormValues) {
  const payload = toCreateCustomerPayload(values);
  const response = await apiClient.post<ApiSuccessResponse<Customer>>('/customers', payload);
  return response.data.data;
}

export async function updateCustomer(id: string, values: CreateCustomerFormValues) {
  const payload = toCreateCustomerPayload(values);
  const response = await apiClient.put<ApiSuccessResponse<Customer>>(`/customers/${id}`, payload);
  return response.data.data;
}

export async function deleteCustomer(id: string) {
  const response = await apiClient.delete<{ success: boolean; message: string; data: Customer }>(`/customers/${id}`);
  return response.data;
}

// ─── Customer Contacts ──────────────────────────────────────

export async function listCustomerContacts(customerId: string) {
  const response = await apiClient.get<ApiSuccessResponse<CustomerContact[]>>(
    `/customers/${customerId}/contacts`
  );
  return response.data.data;
}

export async function createCustomerContact(
  customerId: string,
  values: CustomerContactFormValues
) {
  const payload = toCustomerContactPayload(values);
  const response = await apiClient.post<ApiSuccessResponse<CustomerContact>>(
    `/customers/${customerId}/contacts`,
    payload
  );
  return response.data.data;
}

export async function updateCustomerContact(
  customerId: string,
  contactId: string,
  values: CustomerContactFormValues
) {
  const payload = toCustomerContactPayload(values);
  const response = await apiClient.put<ApiSuccessResponse<CustomerContact>>(
    `/customers/${customerId}/contacts/${contactId}`,
    payload
  );
  return response.data.data;
}

export async function deleteCustomerContact(customerId: string, contactId: string) {
  await apiClient.delete(`/customers/${customerId}/contacts/${contactId}`);
}
