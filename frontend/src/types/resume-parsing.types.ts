export interface ParsedSkill {
  skill: string
  years_exp?: number
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  is_primary: boolean
}

export interface ParsedWorkHistory {
  company_name: string
  role_title: string
  employment_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship'
  start_date?: string
  end_date?: string
  is_current: boolean
  responsibilities?: string
  technologies_used: string[]
}

export interface ParsedEducation {
  institution: string
  degree: string
  field_of_study?: string
  start_year?: number
  end_year?: number
  is_current: boolean
}

export interface ParsedResumeData {
  full_name?: string
  email?: string
  phone?: string
  current_location?: string
  exp_years?: number
  current_company?: string
  current_role?: string
  highest_qualification?: string
  skills: ParsedSkill[]
  work_history: ParsedWorkHistory[]
  education: ParsedEducation[]
  raw_ocr_text: string
}

export interface ResumeUploadResponse {
  upload_id: string
  parsed_data: ParsedResumeData
}

export interface ResumeUploadRecord {
  id: string
  status: 'pending' | 'processing' | 'parsed' | 'failed'
  parsed_data?: ParsedResumeData
  error_message?: string
}
