import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import {
  formatBudget,
  formatUnderscoreLabel,
  getBudgetLabel,
  getRequirementExpiry,
} from '../../../lib/formatters';
import type { Requirement } from '../../../types/requirement.types';

interface RequirementsTableProps {
  requirements: Requirement[];
  isLoading: boolean;
  isError: boolean;
  onViewDetails: (requirementId: string) => void;
}

function statusPillClass(status: Requirement['status']) {
  if (status === 'open') return 'bg-green-100 text-green-800';
  if (status === 'on_hold') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-700';
}

// Priority drives the left severity stripe — encoded in form, not just a word.
const PRIORITY_STRIPE: Record<string, string> = {
  urgent: '#c0392b',
  high: '#b7791f',
  medium: '#4a6fa5',
  low: '#2e7d55',
};

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  isLoading,
  isError,
  onViewDetails,
}) => (
  <div className="bg-surface-container-lowest border border-outline-variant rounded-[12px] shadow-sm flex flex-col relative flex-1 min-h-[400px] w-full max-w-full min-w-0 overflow-hidden">
    <div className="overflow-x-auto custom-scrollbar w-full flex-1">
      <table className="w-full text-left border-collapse min-w-[1100px]">
        <thead className="sticky top-0 bg-surface-container-high z-10 border-b border-outline-variant">
          <tr>
            <th className="pl-6 pr-4 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Role</th>
            <th className="px-4 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Client</th>
            <th className="px-4 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Budget</th>
            <th className="px-4 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Exp</th>
            <th className="px-4 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-center">Positions</th>
            <th className="px-4 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Timeline</th>
            <th className="px-4 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Status</th>
            <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={8}><LoadingState /></td></tr>
          ) : isError ? (
            <tr><td colSpan={8} className="p-8 text-center text-error">Failed to load records</td></tr>
          ) : requirements.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center opacity-60">
                  <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>assignment</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">No requirements yet</h3>
                  <p className="font-body-md text-on-surface-variant max-w-sm">
                    Use &apos;Add Requirement&apos; or import a spreadsheet to create your first role.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            requirements.map((requirement) => {
              const stripe = PRIORITY_STRIPE[requirement.priority] ?? PRIORITY_STRIPE.low;
              const { isExpired, daysRemaining } = getRequirementExpiry(
                requirement.created_at,
                requirement.ttl_months
              );
              const pct = Math.max(
                0,
                Math.min(100, Math.round((daysRemaining / (requirement.ttl_months * 30)) * 100))
              );
              const barColor = isExpired ? '#c0392b' : pct < 34 ? '#b7791f' : '#2e7d55';
              const monthsLeft = Math.max(0, Math.ceil(daysRemaining / 30));

              return (
                <tr
                  key={requirement.id}
                  className="group border-b border-outline-variant/50 hover:bg-surface-variant/5 transition-colors"
                >
                  <td className="pl-6 pr-4 py-4 border-l-[3px]" style={{ borderLeftColor: stripe }}>
                    <div className="font-body-md font-semibold text-on-surface">
                      {requirement.role?.title ?? 'N/A'}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5 capitalize">
                      {formatUnderscoreLabel(requirement.hiring_type)} ·{' '}
                      {formatUnderscoreLabel(requirement.billing_entity).replace('git ', '').toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-body-md text-on-surface">
                    {requirement.customer?.name ?? 'N/A'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-body-md text-on-surface tabular-nums">
                      {formatBudget(requirement.budget_min, requirement.budget_max, requirement.budget_currency)}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5">
                      {getBudgetLabel(requirement.hiring_type)}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-body-md text-on-surface tabular-nums">
                    {requirement.min_exp_years}–{requirement.max_exp_years}y
                  </td>
                  <td className="px-4 py-4 font-body-md text-on-surface text-center tabular-nums">
                    {requirement.no_of_positions}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-[70px] h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant whitespace-nowrap">
                          {monthsLeft}mo left
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusPillClass(requirement.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {formatUnderscoreLabel(requirement.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onViewDetails(requirement.id)}
                        title="View details"
                        className="w-8 h-8 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);
