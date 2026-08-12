import { z } from 'zod';
import { parseCommaSeparatedList } from '../lib/formatters';
import type { HiringType, RequirementStatus, JobPriority, WorkMode } from '../types/requirement.types';

export const requirementStatusSchema = z.enum(['open', 'on_hold', 'filled', 'cancelled']);
export const hiringTypeSchema = z.enum(['contract', 'permanent', 'fixed_term']);
export const workModeSchema = z.enum(['onsite', 'remote', 'hybrid']);
export const jobPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const billingEntitySchema = z.enum(['git_uk_ltd', 'git_india_llp', 'git_uae_fze']);

export const BILLING_ENTITY_OPTIONS: { value: z.infer<typeof billingEntitySchema>; label: string }[] = [
  { value: 'git_uk_ltd', label: 'GIT Software Technologies Limited (UK)' },
  { value: 'git_india_llp', label: 'GIT Software Technologies LLP (India)' },
  { value: 'git_uae_fze', label: 'GIT Software Technologies FZE (UAE)' },
];

export const createRequirementFormSchema = z
  .object({
    customer_id: z.string().min(1, 'Customer is required').uuid('Invalid customer ID'),
    role_id: z.string().min(1, 'Role is required').uuid('Invalid role ID'),
    billing_entity: billingEntitySchema,
    status: requirementStatusSchema.default('open'),
    min_exp_years: z.coerce.number().int().min(0).max(60),
    max_exp_years: z.coerce.number().int().min(0).max(60),
    budget_min: z.string().optional(),
    budget_max: z.string().optional(),
    budget_currency: z.string().length(3, 'Currency must be 3 characters').default('GBP'),
    hiring_type: hiringTypeSchema,
    min_contract_months: z.string().optional(),
    expected_start_date: z.string().optional(),
    notice_period_buyback: z.boolean().default(false),
    no_of_positions: z.coerce.number().int().min(1).max(1000),
    location: z.string().min(1, 'Location is required').max(100),
    work_mode: workModeSchema,
    job_description: z.string().max(10000).optional(),
    required_skills: z.string().min(1, 'At least one required skill is needed'),
    nice_to_have_skills: z.string().optional(),
    priority: jobPrioritySchema.default('medium'),
    visa_sponsorship_available: z.boolean().optional(),
    clearance_required: z.string().max(100).optional(),
  })
  .refine((data) => data.max_exp_years >= data.min_exp_years, {
    message: 'Max experience must be greater than or equal to min experience',
    path: ['max_exp_years'],
  });

export type CreateRequirementFormValues = z.infer<typeof createRequirementFormSchema>;

export const createRequirementFormDefaults: CreateRequirementFormValues = {
  customer_id: '',
  role_id: '',
  billing_entity: 'git_uk_ltd',
  status: 'open',
  min_exp_years: 0,
  max_exp_years: 5,
  budget_min: '',
  budget_max: '',
  budget_currency: 'GBP',
  hiring_type: 'permanent',
  min_contract_months: '',
  expected_start_date: '',
  notice_period_buyback: false,
  no_of_positions: 1,
  location: '',
  work_mode: 'hybrid',
  job_description: '',
  required_skills: '',
  nice_to_have_skills: '',
  priority: 'medium',
  visa_sponsorship_available: false,
  clearance_required: '',
};

export function toCreateRequirementPayload(values: CreateRequirementFormValues) {
  const parsed = createRequirementFormSchema.parse(values);

  const payload: Record<string, unknown> = {
    customer_id: parsed.customer_id,
    role_id: parsed.role_id,
    billing_entity: parsed.billing_entity,
    status: parsed.status as RequirementStatus,
    min_exp_years: parsed.min_exp_years,
    max_exp_years: parsed.max_exp_years,
    budget_currency: parsed.budget_currency,
    hiring_type: parsed.hiring_type as HiringType,
    notice_period_buyback: parsed.notice_period_buyback,
    no_of_positions: parsed.no_of_positions,
    location: parsed.location,
    work_mode: parsed.work_mode as WorkMode,
    priority: parsed.priority as JobPriority,
    required_skills: parseCommaSeparatedList(parsed.required_skills),
  };

  if (parsed.budget_min) payload.budget_min = Number(parsed.budget_min);
  if (parsed.budget_max) payload.budget_max = Number(parsed.budget_max);
  if (parsed.min_contract_months) {
    payload.min_contract_months = Number(parsed.min_contract_months);
  }
  if (parsed.expected_start_date) {
    payload.expected_start_date = new Date(parsed.expected_start_date).toISOString();
  }
  if (parsed.job_description) payload.job_description = parsed.job_description;
  if (parsed.visa_sponsorship_available !== undefined) {
    payload.visa_sponsorship_available = parsed.visa_sponsorship_available;
  }
  if (parsed.clearance_required?.trim()) {
    payload.clearance_required = parsed.clearance_required.trim();
  }

  const niceToHave = parseCommaSeparatedList(parsed.nice_to_have_skills ?? '');
  if (niceToHave.length > 0) payload.nice_to_have_skills = niceToHave;

  return payload;
}
