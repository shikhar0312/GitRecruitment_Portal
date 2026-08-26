import { z } from 'zod';
import type { CreateInterviewRoundInput } from '../types/allocation.types';

export const allocationStatusSchema = z.enum([
  'shortlisted',
  'screening',
  'interviewing',
  'offered',
  'placed',
  'rejected',
  'withdrawn',
]);

export const createAllocationFormSchema = z.object({
  requirement_id: z.string().uuid('Please select a requirement'),
  candidate_id: z.string().uuid('Please select a candidate'),
  expected_availability: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

export type CreateAllocationFormValues = z.infer<typeof createAllocationFormSchema>;

export const createAllocationFormDefaults: CreateAllocationFormValues = {
  requirement_id: '',
  candidate_id: '',
  expected_availability: '',
  notes: '',
};

export function toCreateAllocationPayload(values: CreateAllocationFormValues) {
  const parsed = createAllocationFormSchema.parse(values);
  const payload: Record<string, unknown> = {
    requirement_id: parsed.requirement_id,
    candidate_id: parsed.candidate_id,
    status: 'shortlisted',
  };

  if (parsed.expected_availability) {
    payload.expected_availability = new Date(parsed.expected_availability).toISOString();
  }
  if (parsed.notes?.trim()) {
    payload.notes = parsed.notes.trim();
  }

  return payload;
}

export const interviewRoundFormSchema = z.object({
  round_number: z.coerce.number().int().min(1).max(20),
  round_type: z.enum(['screening', 'technical', 'hr', 'cultural_fit', 'final']),
  mode: z.enum(['video', 'phone', 'onsite']).optional(),
  scheduled_at: z.string().optional(),
  conducted_by: z.string().max(100).optional(),
  outcome: z.enum(['passed', 'failed', 'no_show', 'rescheduled']).optional(),
  feedback: z.string().max(5000).optional(),
});

export type InterviewRoundFormValues = z.infer<typeof interviewRoundFormSchema>;

export const statusTransitionFormSchema = z.object({
  rejection_reason: z.string().max(1000).optional(),
  offer_date: z.string().optional(),
  placed_date: z.string().optional(),
});

export type StatusTransitionFormValues = z.infer<typeof statusTransitionFormSchema>;

export function toInterviewRoundPayload(values: InterviewRoundFormValues): CreateInterviewRoundInput {
  const parsed = interviewRoundFormSchema.parse(values);
  const payload: CreateInterviewRoundInput = {
    round_number: parsed.round_number,
    round_type: parsed.round_type,
  };
  if (parsed.mode) payload.mode = parsed.mode;
  if (parsed.scheduled_at) payload.scheduled_at = new Date(parsed.scheduled_at).toISOString();
  if (parsed.conducted_by?.trim()) payload.conducted_by = parsed.conducted_by.trim();
  if (parsed.outcome) payload.outcome = parsed.outcome;
  if (parsed.feedback?.trim()) payload.feedback = parsed.feedback.trim();
  return payload;
}

export function toStatusTransitionPayload(
  status: 'rejected' | 'offered' | 'placed',
  values: StatusTransitionFormValues
) {
  const payload: Record<string, unknown> = { status };
  if (status === 'rejected' && values.rejection_reason?.trim()) {
    payload.rejection_reason = values.rejection_reason.trim();
  }
  if (status === 'offered' && values.offer_date) {
    payload.offer_date = new Date(values.offer_date).toISOString();
  }
  if (status === 'placed' && values.placed_date) {
    payload.placed_date = new Date(values.placed_date).toISOString();
  }
  return payload;
}
