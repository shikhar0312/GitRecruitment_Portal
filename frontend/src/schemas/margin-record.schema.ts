import { z } from 'zod';

export const paymentStatusSchema = z.enum(['pending', 'invoiced', 'paid', 'overdue']);

// billing_entity and reporting_currency are NOT collected here — they're
// derived server-side from the selected allocation's requirement, same as
// the backend. The form only needs to know the reporting currency (passed
// in separately, once an allocation is picked) to decide whether to show
// the FX rate fields at all.
export const createMarginRecordFormSchema = z.object({
  allocation_id: z.string().uuid('Please select a placed allocation'),
  demand_amount: z.string().min(1, 'Demand amount is required'),
  demand_currency: z.string().length(3, 'Currency must be 3 characters'),
  demand_fx_rate: z.string().optional(),
  billed_amount: z.string().min(1, 'Billed amount is required'),
  billed_currency: z.string().length(3, 'Currency must be 3 characters'),
  billed_fx_rate: z.string().optional(),
  invoice_ref: z.string().max(100).optional(),
  billing_period_start: z.string().optional(),
  billing_period_end: z.string().optional(),
  payment_status: paymentStatusSchema,
  notes: z.string().max(5000).optional(),
});

export type CreateMarginRecordFormInput = z.infer<typeof createMarginRecordFormSchema>;

export function createMarginRecordFormDefaults(reportingCurrency = 'GBP'): CreateMarginRecordFormInput {
  return {
    allocation_id: '',
    demand_amount: '',
    demand_currency: reportingCurrency,
    demand_fx_rate: '1',
    billed_amount: '',
    billed_currency: reportingCurrency,
    billed_fx_rate: '1',
    invoice_ref: '',
    billing_period_start: '',
    billing_period_end: '',
    payment_status: 'pending',
    notes: '',
  };
}

export function toCreateMarginRecordPayload(
  values: CreateMarginRecordFormInput,
  reportingCurrency: string
) {
  const demandAmount = Number(values.demand_amount);
  const billedAmount = Number(values.billed_amount);

  if (!Number.isFinite(demandAmount) || demandAmount <= 0) {
    throw new Error('Demand amount must be a positive number');
  }
  if (!Number.isFinite(billedAmount) || billedAmount <= 0) {
    throw new Error('Billed amount must be a positive number');
  }

  // Same-currency deals don't need a real FX rate — the backend forces
  // this to 1 regardless of what's sent, so the form does the same to
  // avoid asking the user to type a meaningless "1".
  const demandSameCurrency = values.demand_currency.toUpperCase() === reportingCurrency;
  const billedSameCurrency = values.billed_currency.toUpperCase() === reportingCurrency;

  const demandFxRate = demandSameCurrency ? 1 : Number(values.demand_fx_rate);
  const billedFxRate = billedSameCurrency ? 1 : Number(values.billed_fx_rate);

  if (!demandSameCurrency && (!Number.isFinite(demandFxRate) || demandFxRate <= 0)) {
    throw new Error(`Enter the exchange rate from ${values.demand_currency} to ${reportingCurrency}`);
  }
  if (!billedSameCurrency && (!Number.isFinite(billedFxRate) || billedFxRate <= 0)) {
    throw new Error(`Enter the exchange rate from ${values.billed_currency} to ${reportingCurrency}`);
  }

  const payload: Record<string, unknown> = {
    allocation_id: values.allocation_id,
    demand_amount: demandAmount,
    demand_currency: values.demand_currency.toUpperCase(),
    demand_fx_rate: demandFxRate,
    billed_amount: billedAmount,
    billed_currency: values.billed_currency.toUpperCase(),
    billed_fx_rate: billedFxRate,
    payment_status: values.payment_status,
  };

  if (values.invoice_ref?.trim()) payload.invoice_ref = values.invoice_ref.trim();
  if (values.billing_period_start) {
    payload.billing_period_start = new Date(values.billing_period_start).toISOString();
  }
  if (values.billing_period_end) {
    payload.billing_period_end = new Date(values.billing_period_end).toISOString();
  }
  if (values.notes?.trim()) payload.notes = values.notes.trim();

  return payload;
}

// Amounts can be corrected after creation, but currencies and FX rates
// cannot — see the backend's margin-record.schema.ts for why (the locked
// rate reflects when the deal was made, not when a figure was fixed).
export const updateMarginRecordFormSchema = z.object({
  demand_amount: z.string().optional(),
  billed_amount: z.string().optional(),
  payment_status: paymentStatusSchema,
  invoice_ref: z.string().max(100).optional(),
  billing_period_start: z.string().optional(),
  billing_period_end: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

export type UpdateMarginRecordFormInput = z.infer<typeof updateMarginRecordFormSchema>;

export function toUpdateMarginRecordPayload(values: UpdateMarginRecordFormInput) {
  const payload: Record<string, unknown> = { payment_status: values.payment_status };
  if (values.demand_amount?.trim()) payload.demand_amount = Number(values.demand_amount);
  if (values.billed_amount?.trim()) payload.billed_amount = Number(values.billed_amount);
  if (values.invoice_ref?.trim()) payload.invoice_ref = values.invoice_ref.trim();
  if (values.billing_period_start) {
    payload.billing_period_start = new Date(values.billing_period_start).toISOString();
  }
  if (values.billing_period_end) {
    payload.billing_period_end = new Date(values.billing_period_end).toISOString();
  }
  if (values.notes?.trim()) payload.notes = values.notes.trim();
  return payload;
}
