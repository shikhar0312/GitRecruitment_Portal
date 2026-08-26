import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { hasPermission } from '../../../lib/rbac';
import { formatUnderscoreLabel } from '../../../lib/formatters';
import { BILLING_ENTITY_LABELS } from '../../../types/margin-record.types';
import type { MarginRecord } from '../../../types/margin-record.types';

interface TrackerTableProps {
  records: MarginRecord[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (record: MarginRecord) => void;
}

function paymentStatusClass(status: MarginRecord['payment_status']) {
  if (status === 'paid') return 'bg-green-100 text-green-800';
  if (status === 'overdue') return 'bg-red-100 text-red-800';
  if (status === 'invoiced') return 'bg-blue-100 text-blue-800';
  return 'bg-yellow-100 text-yellow-800';
}

function allocationStatusClass(status: string | undefined) {
  if (status === 'placed') return 'bg-green-100 text-green-800';
  if (status === 'rejected' || status === 'withdrawn') return 'bg-gray-100 text-gray-800';
  return 'bg-blue-100 text-blue-800';
}

function money(amount: number | string, currency: string) {
  const num = Number(amount) || 0;
  return `${currency} ${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export const TrackerTable: React.FC<TrackerTableProps> = ({ records, isLoading, isError, onEdit }) => {
  const canEdit = hasPermission('edit_tracker');

  return (
    <section className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col min-h-[400px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low/30">
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Role</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Candidate</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Entity</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">We pay/mo</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">We bill/mo</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">We bill/yr</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">We keep</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">We keep %</th>
              <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Payment</th>
              {canEdit && (
                <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={12}><LoadingState /></td></tr>
            ) : isError ? (
              <tr><td colSpan={12} className="p-8 text-center text-error">Failed to load tracker records</td></tr>
            ) : records.length === 0 ? (
              <tr>
                <td className="py-32" colSpan={12}>
                  <div className="flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
                        insights
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                      No tracker entries yet
                    </h3>
                    <p className="font-body-md text-on-surface-variant max-w-sm">
                      Entries appear here once a placed allocation is added to the tracker.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const allocation = record.allocation;
                return (
                  <tr key={record.id} className="border-b border-outline-variant/50 hover:bg-surface-variant/5">
                    <td className="px-4 py-4 font-body-md text-on-surface">
                      {allocation?.requirement?.customer?.name ?? '—'}
                    </td>
                    <td className="px-4 py-4 font-body-md text-on-surface">
                      {allocation?.requirement?.role?.title ?? '—'}
                    </td>
                    <td className="px-4 py-4 font-body-md font-semibold text-on-surface">
                      {allocation?.candidate?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${allocationStatusClass(allocation?.status)}`}>
                        {allocation?.status ? formatUnderscoreLabel(allocation.status) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-body-md text-on-surface text-xs">
                      {BILLING_ENTITY_LABELS[record.billing_entity]}
                    </td>
                    <td className="px-4 py-4 font-body-md text-on-surface text-right">
                      {money(record.demand_converted, record.reporting_currency)}
                    </td>
                    <td className="px-4 py-4 font-body-md text-on-surface text-right">
                      {money(record.billed_converted, record.reporting_currency)}
                    </td>
                    <td className="px-4 py-4 font-body-md text-on-surface text-right">
                      {record.billed_converted_yearly
                        ? money(record.billed_converted_yearly, record.reporting_currency)
                        : '—'}
                    </td>
                    <td className="px-4 py-4 font-body-md text-on-surface text-right font-semibold">
                      {money(record.margin_amount, record.reporting_currency)}
                    </td>
                    <td className="px-4 py-4 font-body-md text-on-surface text-right">
                      {(Number(record.margin_pct) || 0).toFixed(1)}%
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${paymentStatusClass(record.payment_status)}`}>
                        {record.payment_status}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-4 py-4 text-right">
                        <button type="button" onClick={() => onEdit(record)} className="text-primary text-sm font-semibold hover:underline">
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
