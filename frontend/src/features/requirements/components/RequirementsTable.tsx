import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import {
  formatBudget,
  formatDate,
  formatUnderscoreLabel,
  getBudgetLabel,
  getRequirementExpiry,
} from '../../../lib/formatters';
import type { Requirement } from '../../../types/requirement.types';

interface RequirementsTableProps {
  requirements: Requirement[];
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  onViewDetails: (requirementId: string) => void;
}

function statusBadgeClass(status: Requirement['status']) {
  if (status === 'open') return 'bg-green-100 text-green-800';
  if (status === 'on_hold') return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  page,
  pageSize,
  isLoading,
  isError,
  onViewDetails,
}) => (
  <div className="bg-surface-container-lowest border border-outline-variant rounded-[12px] shadow-sm flex flex-col relative flex-1 min-h-[400px] w-full max-w-full min-w-0 overflow-hidden">
    <div className="overflow-x-auto custom-scrollbar w-full flex-1">
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead className="sticky top-0 bg-surface-container-high z-10 border-b border-outline-variant">
          <tr>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">S.No</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Customer</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Role</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-center">
              Status
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Location</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Min Exp</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Budget</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Hiring Type</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-center">
              Positions
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Start Date</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={11}>
                <LoadingState />
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td colSpan={11} className="p-8 text-center text-error">
                Failed to load records
              </td>
            </tr>
          ) : requirements.length === 0 ? (
            <tr>
              <td colSpan={11}>
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">
                      inventory_2
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                    No records found
                  </h3>
                  <p className="font-body-md text-on-surface-variant max-w-sm">
                    Data will appear here once records are added. Use the &apos;Add Requirement&apos;
                    button to create your first requirement listing.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            requirements.map((requirement, index) => (
              <tr key={requirement.id} className="border-b border-outline-variant/50 hover:bg-surface-variant/5">
                <td className="px-6 py-4 font-body-md text-on-surface">
                  {(page - 1) * pageSize + index + 1}
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface">
                  {requirement.customer?.name ?? 'N/A'}
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface">
                  {requirement.role?.title ?? 'N/A'}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusBadgeClass(requirement.status)}`}
                    >
                      {formatUnderscoreLabel(requirement.status)}
                    </span>
                    {requirement.status === 'open' &&
                      getRequirementExpiry(requirement.created_at, requirement.ttl_months).isExpired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-800">
                          Expired
                        </span>
                      )}
                  </div>
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface">{requirement.location}</td>
                <td className="px-6 py-4 font-body-md text-on-surface">{requirement.min_exp_years} yrs</td>
                <td className="px-6 py-4 font-body-md text-on-surface">
                  <div className="text-xs text-on-surface-variant uppercase tracking-wide">
                    {getBudgetLabel(requirement.hiring_type)}
                  </div>
                  {formatBudget(requirement.budget_min, requirement.budget_max, requirement.budget_currency)}
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface capitalize">
                  {formatUnderscoreLabel(requirement.hiring_type)}
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface text-center">
                  {requirement.no_of_positions}
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface">
                  {formatDate(requirement.expected_start_date)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onViewDetails(requirement.id)}
                    className="text-on-surface-variant hover:text-primary transition-colors p-1"
                    title="View Details"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
