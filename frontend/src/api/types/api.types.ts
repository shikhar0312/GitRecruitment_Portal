export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

export type UserRole = 'admin' | 'recruiter' | 'account_manager' | 'finance' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}
