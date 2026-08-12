import React from 'react';
import { BILLING_ENTITY_LABELS } from '../../../types/margin-record.types';
import type { DashboardEntityMarginSummary } from '../../../types/dashboard.types';

interface DashboardMarginByEntityProps {
  entities: DashboardEntityMarginSummary[] | null;
}

function money(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// Deliberately shows three separate currency subtotals rather than one
// blended "total revenue" figure. Each GIT entity (UK Ltd / India LLP /
// UAE FZE) bills in its own currency, and combining them would require
// applying a live FX rate to historical deals — which would make the
// number silently drift every time exchange rates move, even for
// placements that closed months ago. Three accurate numbers beat one
// number that quietly changes for no business reason.
export const DashboardMarginByEntity: React.FC<DashboardMarginByEntityProps> = ({ entities }) => {
  if (!entities) return null;

  return (
    <section className="mt-6">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Margin by Entity</h2>
      <p className="font-body-md text-on-surface-variant mb-4">
        Shown separately per entity's own currency — see the Tracker for full detail.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {entities.map((entity) => (
          <div
            key={entity.billing_entity}
            className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant custom-shadow-l1 flex flex-col gap-3"
          >
            <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
              {BILLING_ENTITY_LABELS[entity.billing_entity]}
            </div>
            <div>
              <div className="text-display-md font-display-md text-on-surface">
                {money(entity.total_margin_monthly, entity.currency)}
              </div>
              <div className="font-label-md text-label-md text-on-surface-variant">
                Margin / month ({entity.margin_pct.toFixed(1)}%)
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant text-sm">
              <div>
                <div className="text-on-surface font-semibold">
                  {money(entity.total_billed_monthly, entity.currency)}
                </div>
                <div className="text-xs text-on-surface-variant">Billed / month</div>
              </div>
              <div>
                <div className="text-on-surface font-semibold">
                  {money(entity.total_demand_monthly, entity.currency)}
                </div>
                <div className="text-xs text-on-surface-variant">Demand / month</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
