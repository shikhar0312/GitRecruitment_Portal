import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { hasPermission } from '../../../lib/rbac';
import { BILLING_ENTITY_LABELS, REPORTING_CURRENCY_BY_ENTITY } from '../../../types/margin-record.types';
import type { MarginRecord, BillingEntity } from '../../../types/margin-record.types';

interface TrackerTableProps {
  records: MarginRecord[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (record: MarginRecord) => void;
}

function paymentPillClass(status: MarginRecord['payment_status']) {
  if (status === 'paid') return 'bg-green-100 text-green-800';
  if (status === 'overdue') return 'bg-red-100 text-red-800';
  if (status === 'invoiced') return 'bg-blue-100 text-blue-800';
  return 'bg-yellow-100 text-yellow-800';
}

// Margin health: green healthy, amber thin, red at-risk. Same thresholds the
// dashboard uses so the two views agree.
function marginPillClass(pct: number) {
  if (pct >= 18) return 'bg-green-100 text-green-800';
  if (pct >= 12) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

// Each entity bills in its own currency; the tag is colour-coded so the eye
// can group rows by entity down the column.
function entityTagClass(entity: BillingEntity) {
  if (entity === 'git_india_llp') return 'bg-blue-50 text-blue-700';
  if (entity === 'git_uae_fze') return 'bg-green-50 text-green-700';
  return 'bg-surface-container-low text-on-surface-variant';
}

function money(amount: number | string, currency: string) {
  const num = Number(amount) || 0;
  return `${currency} ${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function currencySymbol(entity: BillingEntity) {
  const code = REPORTING_CURRENCY_BY_ENTITY[entity];
  if (code === 'GBP') return '£';
  if (code === 'INR') return '₹';
  if (code === 'AED') return 'د.إ';
  return code;
}

export const TrackerTable: React.FC<TrackerTableProps> = ({ records, isLoading, isError, onEdit }) => {
  const canEdit = hasPermission('edit_tracker');

  // Per-currency margin subtotal for the footer — never blended across
  // currencies, matching the app's FX rule.
  const marginByCurrency = records.reduce<Record<string, number>>((acc, r) => {
    const cur = r.reporting_currency;
    acc[cur] = (acc[cur] ?? 0) + (Number(r.margin_amount) || 0);
    return acc;
  }, {});
  const subtotal = Object.entries(marginByCurrency)
    .map(([cur, amt]) => money(amt, cur))
    .join('  ·  ');

  const colCount = canEdit ? 8 : 7;

  return (
    <section className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col min-h-[400px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low/30">
              <th className="px-5 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Client · Candidate</th>
              <th className="px-5 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Entity</th>
              <th className="px-5 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-right">We pay</th>
              <th className="px-5 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-right">We bill</th>
              <th className="px-5 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-right">Margin</th>
              <th className="px-5 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-right">%</th>
              <th className="px-5 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Payment</th>
              {canEdit && (
                <th className="px-5 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={colCount}><LoadingState /></td></tr>
            ) : isError ? (
              <tr><td colSpan={colCount} className="p-8 text-center text-error">Failed to load tracker records</td></tr>
            ) : records.length === 0 ? (
              <tr>
                <td className="py-32" colSpan={colCount}>
                  <div className="flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-5">
                      <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>insights</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">No tracker entries yet</h3>
                    <p className="font-body-md text-on-surface-variant max-w-sm">
                      Entries appear here once a placed allocation is added to the tracker.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const allocation = record.allocation;
                const pct = Number(record.margin_pct) || 0;
                const sym = currencySymbol(record.billing_entity);
                return (
                  <tr
                    key={record.id}
                    className="group border-b border-outline-variant/50 hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-body-md font-semibold text-on-surface">
                        {allocation?.requirement?.customer?.name ?? '—'}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        {allocation?.candidate?.full_name ?? '—'}
                        {allocation?.requirement?.role?.title
                          ? ` · ${allocation.requirement.role.title}`
                          : ''}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${entityTagClass(record.billing_entity)}`}>
                        {BILLING_ENTITY_LABELS[record.billing_entity].replace('GIT ', '')} · {sym}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-on-surface tabular-nums">
                      {money(record.demand_converted, record.reporting_currency)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-sm text-on-surface tabular-nums">
                      {money(record.billed_converted, record.reporting_currency)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-sm font-semibold tabular-nums text-green-700">
                      +{money(record.margin_amount, record.reporting_currency)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${marginPillClass(pct)}`}>
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${paymentPillClass(record.payment_status)}`}>
                        {record.payment_status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEdit(record)}
                            title="Edit"
                            className="w-8 h-8 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          {!isLoading && !isError && records.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-outline-variant">
                <td colSpan={4} className="px-5 py-3.5 text-right text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Margin on this page, per currency
                </td>
                <td colSpan={colCount - 4} className="px-5 py-3.5 font-mono text-sm font-semibold text-on-surface tabular-nums">
                  {subtotal}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
};
