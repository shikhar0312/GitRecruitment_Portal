import { z } from 'zod';

export const candidateStatusSchema = z.enum(['active', 'placed', 'inactive', 'blacklisted']);

export const availabilityStatusSchema = z.enum([
  'immediate',
  'notice_period',
  'not_looking',
  'open_to_opportunities',
]);

export const candidateSourceSchema = z.enum([
  'referral',
  'linkedin',
  'job_board',
  'direct',
  'agency',
]);

export const createCandidateFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().min(1, 'Phone is required').max(20),
  exp_years: z.coerce.number().int().min(0).max(60),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  expected_day_rate: z.string().optional(),
  availability_status: availabilityStatusSchema,
  preferred_location: z.string().max(100).optional(),
  source: candidateSourceSchema,
  skills: z.string().optional(),
  requires_visa_sponsorship: z.boolean().optional(),
  visa_status: z.string().max(100).optional(),
  security_clearance_level: z.string().max(100).optional(),
  security_clearance_expiry: z.string().optional(),
});

export type CreateCandidateFormValues = z.infer<typeof createCandidateFormSchema>;

export const createCandidateFormDefaults: CreateCandidateFormValues = {
  full_name: '',
  email: '',
  phone: '',
  exp_years: 0,
  currency: 'GBP',
  expected_day_rate: '',
  availability_status: 'immediate',
  preferred_location: '',
  source: 'linkedin',
  skills: '',
  requires_visa_sponsorship: false,
  visa_status: '',
  security_clearance_level: '',
  security_clearance_expiry: '',
};

export function toCreateCandidatePayload(values: CreateCandidateFormValues) {
  const parsed = createCandidateFormSchema.parse(values);
  const payload: Record<string, unknown> = {
    full_name: parsed.full_name,
    email: parsed.email,
    phone: parsed.phone,
    exp_years: parsed.exp_years,
    currency: parsed.currency,
    availability_status: parsed.availability_status,
    source: parsed.source,
  };

  if (parsed.preferred_location) {
    payload.preferred_location = parsed.preferred_location;
  }

  if (parsed.expected_day_rate?.trim()) {
    payload.expected_day_rate = Number(parsed.expected_day_rate);
  }

  if (parsed.requires_visa_sponsorship !== undefined) {
    payload.requires_visa_sponsorship = parsed.requires_visa_sponsorship;
  }
  if (parsed.visa_status?.trim()) {
    payload.visa_status = parsed.visa_status.trim();
  }
  if (parsed.security_clearance_level?.trim()) {
    payload.security_clearance_level = parsed.security_clearance_level.trim();
  }
  if (parsed.security_clearance_expiry) {
    payload.security_clearance_expiry = new Date(parsed.security_clearance_expiry).toISOString();
  }

  return payload;
}

export function parseSkillsList(skills: string | undefined): string[] {
  if (!skills?.trim()) return [];
  return skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
