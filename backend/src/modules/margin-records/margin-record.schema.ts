import { z } from 'zod'

// Note: billing_entity and reporting_currency are NOT accepted as input.
// They're derived server-side from the allocation's requirement at
// creation time, so a margin record always reflects which GIT entity
// actually owns that deal — not whatever a user happens to type.
export const CreateMarginRecordSchema = z.object({
  allocation_id: z.string().uuid('Invalid allocation ID'),

  demand_amount: z.number().positive().max(10000000),
  demand_currency: z.string().length(3),
  demand_fx_rate: z.number().positive().max(1000),

  billed_amount: z.number().positive().max(10000000),
  billed_currency: z.string().length(3),
  billed_fx_rate: z.number().positive().max(1000),

  invoice_ref: z.string().max(100).optional(),
  billing_period_start: z.string().datetime().optional(),
  billing_period_end: z.string().datetime().optional(),
  payment_status: z.enum(['pending', 'invoiced', 'paid', 'overdue']).default('pending'),
  notes: z.string().max(5000).optional(),
})

// FX rates, currencies, and billing_entity are intentionally excluded here.
// Once a margin record is created, the exchange rate used is locked
// permanently — editing later can correct the underlying amounts (e.g. a
// typo in the bill), but must recompute using the ORIGINAL locked rate,
// never a new one. If the currency itself was wrong, the record should be
// deleted and recreated, not edited, since that's a different deal shape
// entirely.
export const UpdateMarginRecordSchema = z.object({
  demand_amount: z.number().positive().max(10000000).optional(),
  billed_amount: z.number().positive().max(10000000).optional(),
  invoice_ref: z.string().max(100).optional(),
  billing_period_start: z.string().datetime().optional(),
  billing_period_end: z.string().datetime().optional(),
  payment_status: z.enum(['pending', 'invoiced', 'paid', 'overdue']).optional(),
  notes: z.string().max(5000).optional(),
})

export const MarginRecordQuerySchema = z.object({
  payment_status: z.enum(['pending', 'invoiced', 'paid', 'overdue']).optional(),
  billing_entity: z.enum(['git_uk_ltd', 'git_india_llp', 'git_uae_fze']).optional(),
  customer_id: z.string().uuid().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(100).default(20),
})

export type CreateMarginRecordInput = z.infer<typeof CreateMarginRecordSchema>
export type UpdateMarginRecordInput = z.infer<typeof UpdateMarginRecordSchema>
export type MarginRecordQuery = z.infer<typeof MarginRecordQuerySchema>
