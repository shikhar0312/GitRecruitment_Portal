import apiClient from '../client';
import type { ApiSuccessResponse, LoginResult } from '../types/api.types';
import type { LoginFormValues } from '../../schemas/auth.schema';

export async function login(credentials: LoginFormValues): Promise<LoginResult> {
  const response = await apiClient.post<ApiSuccessResponse<LoginResult>>(
    '/auth/login',
    credentials
  );
  return response.data.data;
}
