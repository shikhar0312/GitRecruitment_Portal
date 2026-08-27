export type RequirementStatus = 'open' | 'on_hold' | 'filled' | 'cancelled';
export type HiringType = 'contract' | 'permanent' | 'fixed_term';
export type WorkMode = 'onsite' | 'remote' | 'hybrid';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type BillingEntity = 'git_uk_ltd' | 'git_india_llp' | 'git_uae_fze';

export interface RequirementCustomer {
  id: string;
  name: string;
  industry?: string | null;
  city?: string | null;
}

export interface RequirementRole {
  id: string;
  title: string;
  category?: string | null;
}

export interface Requirement {
  id: string;
  customer_id: string;
  role_id: string;
  billing_entity: BillingEntity;
  status: RequirementStatus;
  min_exp_years: number;
  max_exp_years: number;
  budget_min?: number | null;
  budget_max?: number | null;
  budget_currency: string;
  hiring_type: HiringType;
  min_contract_months?: number | null;
  expected_start_date?: string | null;
  notice_period_buyback: boolean;
  no_of_positions: number;
  location: string;
  work_mode: WorkMode;
  job_description?: string | null;
  required_skills: string[];
  nice_to_have_skills: string[];
  priority: JobPriority;
  ttl_months: number;
  visa_sponsorship_available?: boolean | null;
  clearance_required?: string | null;
  closing_date?: string | null;
  created_at: string;
  updated_at: string;
  customer?: RequirementCustomer;
  role?: RequirementRole;
}

export interface RequirementListParams {
  search?: string;
  status?: RequirementStatus;
  hiring_type?: HiringType;
  work_mode?: WorkMode;
  priority?: JobPriority;
  billing_entity?: BillingEntity;
  customer_id?: string;
  role_id?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'priority' | 'expected_start_date' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface RequirementListFilters {
  search: string;
  status: string;
  hiringType: string;
  priority: string;
  workMode: string;
  sortBy: string;
  sortOrder: string;
  page: number;
}

export interface SuggestedCandidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  current_location?: string | null;
  exp_years: number;
  current_company?: string | null;
  current_role?: string | null;
  availability_status: string;
  currency: string;
  expected_day_rate?: number | null;
  match_score: number;
  primary_skills?: { skill: string; proficiency?: string | null }[];
}
