import type { AxiosError } from 'axios';
import type { ApiErrorBody } from '../api/types/api.types';

export function isApiError(error: unknown): error is AxiosError<ApiErrorBody> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong'
): string {
  if (isApiError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getApiFieldErrors(error: unknown): Record<string, string[]> | null {
  if (isApiError(error) && error.response?.data?.errors) {
    return error.response.data.errors;
  }
  return null;
}

export function formatFieldErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
    .join(' | ');
}

export function getValidationErrorMessage(
  error: unknown,
  fallback = 'Validation failed'
): string {
  const fieldErrors = getApiFieldErrors(error);
  if (fieldErrors) {
    return `${fallback}: ${formatFieldErrors(fieldErrors)}`;
  }
  return getApiErrorMessage(error, fallback);
}
