import React from 'react';
import { getMarginHealthClass } from '../../../lib/formatters';
import { BILLING_ENTITY_LABELS } from '../../../types/margin-record.types';
import type { DashboardEntityMarginSummary } from '../../../types/dashboard.types';

interface DashboardMarginByEntityProps {
  entities: DashboardEntityMarginSummary[] | null;
}

function money(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function moneyShort(amount: number, currency: string) {
  if (amount >= 1000) {
    const k = amount / 1000;
    const shown = k >= 100 ? Math.round(k) : Math.round(k * 10) / 10;
    return `${currency} ${shown}k`;
  }
  return money(amount, currency);
}

// Each entity is shown as a money flow, in its own currency:
//   what we pay (demand) → what we keep (margin) = what we bill (client).
// The bar splits billed into the paid-out portion and the kept portion, so
// the "what we keep" tail is visible at a glance — a wider tail means a
// fatter margin. Deliberately three separate currency subtotals, never one
// blended figure: combining GBP / INR / AED would require a live FX rate on
// historical deals, silently drifting the number every time rates move.
export const DashboardMarginByEntity: React.FC<DashboardMarginByEntityProps> = ({ entities }) => {
  if (!entities) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary">payments</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">What each entity keeps</h2>
      </div>
      <p className="font-body-md text-on-surface-variant mb-4">
        For each GIT company: what we pay the candidate, and what we keep — in its own currency.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {entities.map((entity) => {
          const billed = entity.total_billed_monthly;
          // Guard against a zero-billed entity so the bar never divides by 0.
          const paidPct = billed > 0 ? (entity.total_demand_monthly / billed) * 100 : 0;
          const keptPct = billed > 0 ? (entity.total_margin_monthly / billed) * 100 : 0;

          return (
            <div
              key={entity.billing_entity}
              className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant border-l-4 border-l-primary-container custom-shadow-l1 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
                  {BILLING_ENTITY_LABELS[entity.billing_entity]}
                </div>
                <div className="px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant text-xs font-semibold whitespace-nowrap">
                  {entity.placements} {entity.placements === 1 ? 'person placed' : 'people placed'}
                </div>
              </div>

              <div>
                <div className="text-display-md font-display-md text-primary">
                  {money(entity.total_margin_monthly, entity.currency)}
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant">
                  We keep / month{' '}
                  <span className={`font-bold ${getMarginHealthClass(entity.margin_pct)}`}>
                    ({entity.margin_pct.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="mt-1">
                <div className="flex h-7 rounded-lg overflow-hidden gap-0.5" aria-hidden="true">
                  <div
                    className="bg-primary-container/30 flex items-center pl-2 text-xs font-semibold text-on-surface-variant"
                    style={{ width: `${paidPct}%` }}
                  >
                    {moneyShort(entity.total_demand_monthly, entity.currency)}
                  </div>
                  <div className="bg-green-600" style={{ width: `${keptPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant mt-1.5">
                  <span>What we pay</span>
                  <span>= {moneyShort(billed, entity.currency)} billed</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
