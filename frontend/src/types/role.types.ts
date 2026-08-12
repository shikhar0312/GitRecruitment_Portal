export interface Role {
  id: string;
  title: string;
  category?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleListParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}
