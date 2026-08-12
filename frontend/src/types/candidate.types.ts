export type CandidateStatus = 'active' | 'placed' | 'inactive' | 'blacklisted';

export type AvailabilityStatus =
  | 'immediate'
  | 'notice_period'
  | 'not_looking'
  | 'open_to_opportunities';

export type CandidateSource = 'referral' | 'linkedin' | 'job_board' | 'direct' | 'agency';

export interface CandidateSkill {
  id: string;
  skill: string;
  is_primary: boolean;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
}

export interface CandidateWorkHistory {
  id: string;
  company_name: string;
  role_title: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  responsibilities?: string | null;
  location?: string | null;
}

export interface CandidateEducation {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string | null;
  start_year?: number | null;
  end_year?: number | null;
  is_current: boolean;
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  exp_years: number;
  currency: string;
  expected_day_rate?: number | null;
  availability_status: AvailabilityStatus;
  preferred_location?: string | null;
  current_location?: string | null;
  current_role?: string | null;
  current_company?: string | null;
  source?: CandidateSource | null;
  status: CandidateStatus;
  resume_url?: string | null;
  linkedin_url?: string | null;
  notes?: string | null;
  requires_visa_sponsorship?: boolean | null;
  visa_status?: string | null;
  security_clearance_level?: string | null;
  security_clearance_expiry?: string | null;
  created_at: string;
  updated_at: string;
  skills?: CandidateSkill[];
  work_history?: CandidateWorkHistory[];
  education?: CandidateEducation[];
}

export interface CandidateListParams {
  search?: string;
  status?: CandidateStatus;
  page?: number;
  limit?: number;
}

export interface CreateSkillInput {
  skill: string;
  is_primary?: boolean;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}
