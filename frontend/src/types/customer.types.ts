export type CustomerStatus = 'active' | 'inactive' | 'prospect';
export type ContactLabel = 'primary' | 'secondary' | 'hr' | 'procurement' | 'finance' | 'other';

export interface CustomerAccountManager {
  id: string;
  full_name: string;
  email: string;
}

export interface CustomerContact {
  id: string;
  customer_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  label: ContactLabel;
  is_primary: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  country?: string | null;
  city?: string | null;
  status: CustomerStatus;
  notes?: string | null;
  account_manager_id?: string | null;
  created_at: string;
  updated_at: string;
  account_manager?: CustomerAccountManager | null;
  contacts?: CustomerContact[];
}

export interface CustomerListParams {
  search?: string;
  status?: CustomerStatus;
  page?: number;
  limit?: number;
}

export interface CreateCustomerContactInput {
  name: string;
  email?: string;
  phone?: string;
  label: ContactLabel;
  is_primary?: boolean;
  notes?: string;
}

export type UpdateCustomerContactInput = Partial<CreateCustomerContactInput>;
