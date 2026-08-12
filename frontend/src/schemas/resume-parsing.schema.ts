import { z } from 'zod'

export const resumeReviewSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email').max(255),
  phone: z.string().min(1, 'Phone is required').max(20),
  current_location: z.string().max(100).optional(),
  exp_years: z.number().int().min(0).max(60),
  current_company: z.string().max(100).optional(),
  current_role: z.string().max(100).optional(),
  highest_qualification: z.string().max(100).optional(),
  availability_status: z.enum([
    'immediate',
    'notice_period',
    'not_looking',
    'open_to_opportunities',
  ]),
  currency: z.string().length(3),
  status: z.enum(['active', 'placed', 'inactive', 'blacklisted']),
  skills: z.array(z.object({
    skill: z.string().min(1).max(50),
    years_exp: z.number().int().min(0).max(60).optional(),
    proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    is_primary: z.boolean(),
  })).default([]),
  work_history: z.array(z.object({
    company_name: z.string().min(1).max(100),
    role_title: z.string().min(1).max(100),
    employment_type: z.enum([
      'full_time', 'part_time', 'contract', 'freelance', 'internship'
    ]),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    is_current: z.boolean(),
    responsibilities: z.string().max(5000).optional(),
    technologies_used: z.array(z.string()).default([]),
  })).default([]),
  education: z.array(z.object({
    institution: z.string().min(1).max(100),
    degree: z.string().min(1).max(100),
    field_of_study: z.string().max(100).optional(),
    start_year: z.number().int().optional(),
    end_year: z.number().int().optional(),
    is_current: z.boolean().default(false),
  })).default([]),
})

export type ResumeReviewFormValues = z.infer<typeof resumeReviewSchema>
