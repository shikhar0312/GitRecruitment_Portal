import type { AllocationStatus } from '../lib/status-machine';
import type { BillingEntity } from './margin-record.types';

export interface DashboardSummary {
  total_active_requirements: number;
  total_candidates: number;
  allocations_this_month: number;
  total_placed: number;
  total_customers: number;
}

export interface DashboardEntityMarginSummary {
  billing_entity: BillingEntity;
  currency: string;
  total_demand_monthly: number;
  total_billed_monthly: number;
  total_billed_yearly: number;
  total_margin_monthly: number;
  margin_pct: number;
}

export interface DashboardRecentAllocation {
  id: string;
  status: AllocationStatus;
  match_score?: number | null;
  applied_at: string;
  candidate?: { id: string; full_name: string; current_role?: string | null };
  requirement?: {
    id: string;
    role?: { title: string };
    customer?: { name: string };
  };
}

export interface DashboardAggregates {
  summary: DashboardSummary;
  // null when the logged-in user's role can't see the Tracker (viewer) —
  // omitted server-side, not just hidden client-side.
  margin_by_entity: DashboardEntityMarginSummary[] | null;
  requirements_by_priority: Record<string, number>;
  allocations_by_status: Record<string, number>;
  recent_allocations: DashboardRecentAllocation[];
}
