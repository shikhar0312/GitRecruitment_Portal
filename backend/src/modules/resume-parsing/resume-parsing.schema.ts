import { z } from 'zod'

export const ConfirmResumeSchema = z.object({
  full_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(1).max(20),
  alternate_phone: z.string().max(20).optional(),
  current_location: z.string().max(100).optional(),
  exp_years: z.number().int().min(0).max(60),
  current_company: z.string().max(100).optional(),
  current_role: z.string().max(100).optional(),
  highest_qualification: z.string().max(100).optional(),
  currency: z.string().length(3).default('GBP'),
  availability_status: z.enum([
    'immediate',
    'notice_period',
    'not_looking',
    'open_to_opportunities',
  ]).default('open_to_opportunities'),
  status: z.enum(['active', 'placed', 'inactive', 'blacklisted']).default('active'),
  skills: z.array(z.object({
    skill: z.string().min(1).max(50),
    years_exp: z.number().int().min(0).max(60).optional(),
    proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    is_primary: z.boolean().default(false),
  })).max(30).default([]),
  work_history: z.array(z.object({
    company_name: z.string().min(1).max(100),
    role_title: z.string().min(1).max(100),
    employment_type: z.enum([
      'full_time', 'part_time', 'contract', 'freelance', 'internship'
    ]).default('full_time'),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    is_current: z.boolean().default(false),
    responsibilities: z.string().max(5000).optional(),
    technologies_used: z.array(z.string().max(50)).max(30).default([]),
  })).default([]),
  education: z.array(z.object({
    institution: z.string().min(1).max(100),
    degree: z.string().min(1).max(100),
    field_of_study: z.string().max(100).optional(),
    start_year: z.number().int().min(1950).max(2100).optional(),
    end_year: z.number().int().min(1950).max(2100).optional(),
    is_current: z.boolean().default(false),
  })).default([]),
})

export type ConfirmResumeInput = z.infer<typeof ConfirmResumeSchema>