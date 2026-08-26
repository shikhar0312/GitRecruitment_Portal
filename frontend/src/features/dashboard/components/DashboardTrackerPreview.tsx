import React from 'react';
import { Link } from 'react-router-dom';
import { formatUnderscoreLabel, getMarginHealthClass } from '../../../lib/formatters';
import type { MarginRecord } from '../../../types/margin-record.types';

interface DashboardTrackerPreviewProps {
  records: MarginRecord[] | null;
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

// A read-only slice of the Tracker (newest placements) surfaced on the
// dashboard, so leadership sees real candidate-to-client detail without
// leaving the page. The full 11-column table, filtering, pagination and
// editing all still live on the standalone Tracker page, reached via the
// "View full tracker" link.
export const DashboardTrackerPreview: React.FC<DashboardTrackerPreviewProps> = ({ records }) => {
  if (!records) return null;

  return (
    <section className="mt-6 bg-surface-container-low/30 rounded-brand border border-outline-variant/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
              list_alt
            </span>
            <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Recent Placements
            </h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            The latest candidates placed with clients — full detail in the Tracker.
          </p>
        </div>
        <Link
          to="/tracker"
          className="text-sm font-semibold text-primary hover:underline whitespace-nowrap"
        >
          View full tracker →
        </Link>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-on-surface-variant">No tracker entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/40">
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Client
                </th>
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Role
                </th>
                <th className="px-3 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Status
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
              {records.map((record) => {
                const allocation = record.allocation;
                return (
                  <tr
                    key={record.id}
                    className="border-b border-outline-variant/50 hover:bg-surface-variant/5"
                  >
                    <td className="px-3 py-3 font-body-md text-on-surface">
                      {allocation?.requirement?.customer?.name ?? '—'}
                    </td>
                    <td className="px-3 py-3 font-body-md font-semibold text-on-surface">
                      {allocation?.candidate?.full_name ?? '—'}
                    </td>
                    <td className="px-3 py-3 font-body-md text-on-surface">
                      {allocation?.requirement?.role?.title ?? '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${allocationStatusClass(allocation?.status)}`}
                      >
                        {allocation?.status ? formatUnderscoreLabel(allocation.status) : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-body-md text-on-surface text-right">
                      {money(record.billed_converted, record.reporting_currency)}
                    </td>
                    <td
                      className={`px-3 py-3 font-body-md text-right font-bold ${getMarginHealthClass(Number(record.margin_pct) || 0)}`}
                    >
                      {money(record.margin_amount, record.reporting_currency)}
                    </td>
                    <td
                      className={`px-3 py-3 font-body-md text-right font-semibold ${getMarginHealthClass(Number(record.margin_pct) || 0)}`}
                    >
                      {(Number(record.margin_pct) || 0).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
