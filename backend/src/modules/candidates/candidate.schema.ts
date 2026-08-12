import { z } from 'zod'

export const CreateCandidateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().min(1, 'Phone is required').max(20),
  alternate_phone: z.string().max(20).optional(),
  linkedin_url: z.string().url().max(255).optional(),
  github_url: z.string().url().max(255).optional(),
  portfolio_url: z.string().url().max(255).optional(),
  date_of_birth: z.string().datetime().optional(),
  gender: z.string().max(20).optional(),
  nationality: z.string().max(100).optional(),
  current_location: z.string().max(100).optional(),
  preferred_location: z.string().max(100).optional(),
  willing_to_relocate: z.boolean().optional(),
  exp_years: z.number().int().min(0).max(60),
  current_company: z.string().max(100).optional(),
  current_role: z.string().max(100).optional(),
  current_ctc: z.number().min(0).optional(),
  expected_ctc: z.number().min(0).optional(),
  expected_day_rate: z.number().min(0).optional(),
  currency: z.string().length(3).default('GBP'),
  notice_period_days: z.number().int().min(0).max(365).optional(),
  availability_date: z.string().datetime().optional(),
  availability_status: z.enum([
    'immediate',
    'notice_period',
    'not_looking',
    'open_to_opportunities',
  ]),
  highest_qualification: z.string().max(100).optional(),
  requires_visa_sponsorship: z.boolean().optional(),
  visa_status: z.string().max(100).optional(),
  security_clearance_level: z.string().max(100).optional(),
  security_clearance_expiry: z.string().datetime().optional(),
  source: z
    .enum(['referral', 'linkedin', 'job_board', 'direct', 'agency'])
    .optional(),
  referred_by: z.string().max(100).optional(),
  status: z.enum(['active', 'placed', 'inactive', 'blacklisted']).default('active'),
  notes: z.string().max(5000).optional(),
})

export const UpdateCandidateSchema = CreateCandidateSchema.partial()

export const CandidateQuerySchema = z.object({
  status: z.enum(['active', 'placed', 'inactive', 'blacklisted']).optional(),
  availability_status: z
    .enum(['immediate', 'notice_period', 'not_looking', 'open_to_opportunities'])
    .optional(),
  min_exp: z.coerce.number().min(0).max(60).optional(),
  max_exp: z.coerce.number().min(0).max(60).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(100).default(20),
  sortBy: z.enum(['created_at', 'exp_years', 'availability_date']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const CreateSkillSchema = z.object({
  skill: z.string().min(1, 'Skill is required').max(50),
  years_exp: z.number().int().min(0).max(60).optional(),
  proficiency: z
    .enum(['beginner', 'intermediate', 'advanced', 'expert'])
    .optional(),
  is_primary: z.boolean().default(false),
})

export const CreateWorkHistorySchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(100),
  role_title: z.string().min(1, 'Role title is required').max(100),
  employment_type: z.enum([
    'full_time',
    'part_time',
    'contract',
    'freelance',
    'internship',
  ]),
  location: z.string().max(100).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  is_current: z.boolean().default(false),
  responsibilities: z.string().max(5000).optional(),
  achievements: z.string().max(5000).optional(),
  technologies_used: z.array(z.string().max(50)).max(30).default([]),
})

export const CreateEducationSchema = z.object({
  institution: z.string().min(1, 'Institution is required').max(100),
  degree: z.string().min(1, 'Degree is required').max(100),
  field_of_study: z.string().max(100).optional(),
  grade: z.string().max(20).optional(),
  start_year: z.number().int().min(1950).max(2100).optional(),
  end_year: z.number().int().min(1950).max(2100).optional(),
  is_current: z.boolean().default(false),
})

export const CreateCertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required').max(100),
  issuing_organization: z.string().min(1, 'Issuing organization is required').max(100),
  issue_date: z.string().datetime().optional(),
  expiry_date: z.string().datetime().optional(),
  credential_id: z.string().max(100).optional(),
  credential_url: z.string().url().max(255).optional(),
})

export const CreateLanguageSchema = z.object({
  language: z.string().min(1, 'Language is required').max(50),
  proficiency: z.enum(['basic', 'conversational', 'professional', 'native']),
})

export type CreateCandidateInput = z.infer<typeof CreateCandidateSchema>
export type UpdateCandidateInput = z.infer<typeof UpdateCandidateSchema>
export type CandidateQuery = z.infer<typeof CandidateQuerySchema>
export type CreateSkillInput = z.infer<typeof CreateSkillSchema>
export type CreateWorkHistoryInput = z.infer<typeof CreateWorkHistorySchema>
export type CreateEducationInput = z.infer<typeof CreateEducationSchema>
export type CreateCertificationInput = z.infer<typeof CreateCertificationSchema>
export type CreateLanguageInput = z.infer<typeof CreateLanguageSchema>