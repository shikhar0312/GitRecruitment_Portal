import React from 'react';
import { getMarginHealthClass } from '../../../lib/formatters';
import { BILLING_ENTITY_LABELS } from '../../../types/margin-record.types';
import type { DashboardClientMarginSummary } from '../../../types/dashboard.types';

interface DashboardMarginByClientProps {
  clients: DashboardClientMarginSummary[] | null;
}

function money(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// The heart of the "companies' outsourcing" view: which clients we place
// people with and how much margin each generates. Rows are grouped by
// client + entity, so every figure stays in a single reporting currency
// (a client billed through two GIT entities shows two rows) — consistent
// with the no-blend-across-currencies rule used for the entity totals.
export const DashboardMarginByClient: React.FC<DashboardMarginByClientProps> = ({ clients }) => {
  if (!clients) return null;

  return (
    <section className="mt-6 bg-surface-container-lowest rounded-brand border border-outline-variant custom-shadow-l1 p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary">groups</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">What each client earns us</h2>
      </div>
      <p className="font-body-md text-on-surface-variant mb-4">
        Which clients earn us the most each month — how much we bill them and what we keep.
      </p>

      {clients.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No placements tracked yet — add a placed allocation to the Tracker to see client margins.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/40">
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Client
                </th>
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                  People placed
                </th>
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                  We bill / mo
                </th>
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                  We keep / mo
                </th>
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                  We keep %
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={`${client.customer_id}-${client.billing_entity}`}
                  className="border-b border-outline-variant/50 hover:bg-surface-variant/5"
                >
                  <td className="px-3 py-3 font-body-md font-semibold text-on-surface">
                    {client.customer_name}
                  </td>
                  <td className="px-3 py-3 font-body-md text-on-surface text-xs">
                    {BILLING_ENTITY_LABELS[client.billing_entity]}
                  </td>
                  <td className="px-3 py-3 font-body-md text-on-surface text-right">
                    {client.placements}
                  </td>
                  <td className="px-3 py-3 font-body-md text-on-surface text-right">
                    {money(client.total_billed_monthly, client.currency)}
                  </td>
                  <td
                    className={`px-3 py-3 font-body-md text-right font-bold ${getMarginHealthClass(client.margin_pct)}`}
                  >
                    {money(client.total_margin_monthly, client.currency)}
                  </td>
                  <td
                    className={`px-3 py-3 font-body-md text-right font-semibold ${getMarginHealthClass(client.margin_pct)}`}
                  >
                    {client.margin_pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
