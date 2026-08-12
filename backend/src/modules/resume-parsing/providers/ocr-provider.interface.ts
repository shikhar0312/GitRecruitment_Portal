export interface ParsedResumeData {
  full_name?: string
  email?: string
  phone?: string
  current_location?: string
  exp_years?: number
  current_company?: string
  current_role?: string
  highest_qualification?: string
  skills: {
    skill: string
    years_exp?: number
    proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    is_primary: boolean
  }[]
  work_history: {
    company_name: string
    role_title: string
    start_date?: string
    end_date?: string
    is_current: boolean
    responsibilities?: string
    technologies_used?: string[]
  }[]
  education: {
    institution: string
    degree: string
    field_of_study?: string
    start_year?: number
    end_year?: number
  }[]
  raw_ocr_text: string
}

export interface ResumeParsingProvider {
  extractAndParse(filePath: string, mimeType: string): Promise<ParsedResumeData>
}