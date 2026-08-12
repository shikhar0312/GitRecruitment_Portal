export type PaymentStatus = 'pending' | 'invoiced' | 'paid' | 'overdue';
export type BillingEntity = 'git_uk_ltd' | 'git_india_llp' | 'git_uae_fze';

export const BILLING_ENTITY_LABELS: Record<BillingEntity, string> = {
  git_uk_ltd: 'GIT UK Ltd',
  git_india_llp: 'GIT India LLP',
  git_uae_fze: 'GIT UAE FZE',
};

export const REPORTING_CURRENCY_BY_ENTITY: Record<BillingEntity, string> = {
  git_uk_ltd: 'GBP',
  git_india_llp: 'INR',
  git_uae_fze: 'AED',
};

export interface MarginRecordAllocationRef {
  id: string;
  status: string;
  candidate?: { id: string; full_name: string; email: string };
  requirement?: {
    id: string;
    billing_entity?: BillingEntity;
    customer?: { id: string; name: string };
    role?: { id: string; title: string };
  };
}

export interface MarginRecord {
  id: string;
  allocation_id: string;
  billing_entity: BillingEntity;

  demand_amount: number;
  demand_currency: string;
  demand_fx_rate: number;
  demand_converted: number;

  billed_amount: number;
  billed_currency: string;
  billed_fx_rate: number;
  billed_converted: number;
  billed_converted_yearly?: number | null;

  margin_amount: number;
  margin_pct: number;
  reporting_currency: string;
  fx_rate_locked_at: string;

  invoice_ref?: string | null;
  billing_period_start?: string | null;
  billing_period_end?: string | null;
  payment_status: PaymentStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  allocation?: MarginRecordAllocationRef;
}

export interface MarginRecordListParams {
  payment_status?: PaymentStatus;
  billing_entity?: BillingEntity;
  customer_id?: string;
  page?: number;
  limit?: number;
}
