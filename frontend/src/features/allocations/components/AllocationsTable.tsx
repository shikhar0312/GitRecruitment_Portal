import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { hasPermission } from '../../../lib/rbac';
import {
  ALLOCATION_STATUS_LABELS,
  getAllowedNextStatuses,
  getSelectableStatuses,
  type AllocationStatus,
} from '../../../lib/status-machine';
import type { Allocation } from '../../../types/allocation.types';

interface AllocationsTableProps {
  allocations: Allocation[];
  isLoading: boolean;
  isError: boolean;
  isUpdating: boolean;
  onStatusChange: (id: string, status: AllocationStatus) => void;
  onViewDetails: (id: string) => void;
}

function matchScoreBarClass(score: number) {
  if (score > 70) return 'bg-green-500';
  if (score > 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export const AllocationsTable: React.FC<AllocationsTableProps> = ({
  allocations,
  isLoading,
  isError,
  isUpdating,
  onStatusChange,
  onViewDetails,
}) => {
  const canEdit = hasPermission('edit_allocation');

  return (
    <section className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col min-h-[400px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low/30">
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Requirement
              </th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Allocated On
              </th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Match Score
              </th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>
                  <LoadingState />
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-error">
                  Failed to load allocations
                </td>
              </tr>
            ) : allocations.length === 0 ? (
              <tr>
                <td className="py-32" colSpan={6}>
                  <div className="flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                      <span
                        className="material-symbols-outlined text-display-lg"
                        style={{ fontSize: '48px' }}
                      >
                        inbox
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                      No allocations found
                    </h3>
                  </div>
                </td>
              </tr>
            ) : (
              allocations.map((app) => {
                const currentStatus = app.status as AllocationStatus;
                const selectable = getSelectableStatuses(currentStatus);
                const isTerminal = getAllowedNextStatuses(currentStatus).length === 0;

                return (
                  <tr
                    key={app.id}
                    className="border-b border-outline-variant/50 hover:bg-surface-variant/5"
                  >
                    <td className="px-6 py-4">
                      <div className="font-body-md font-semibold text-on-surface">
                        {app.candidate?.full_name}
                      </div>
                      <div className="text-xs text-on-surface-variant">{app.candidate?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body-md text-on-surface">
                        {app.requirement?.role?.title || 'Unknown Role'}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {app.requirement?.customer?.name || 'Unknown Customer'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body-md text-on-surface">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={`h-full ${matchScoreBarClass(app.match_score ?? 0)}`}
                            style={{ width: `${app.match_score ?? 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{app.match_score ?? 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="bg-transparent border border-outline-variant rounded px-2 py-1 text-sm outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        value={currentStatus}
                        onChange={(e) =>
                          onStatusChange(app.id, e.target.value as AllocationStatus)
                        }
                        disabled={!canEdit || isUpdating || isTerminal}
                        title={
                          isTerminal
                            ? 'No further status changes allowed'
                            : 'Select next stage'
                        }
                      >
                        {selectable.map((status) => (
                          <option key={status} value={status}>
                            {ALLOCATION_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewDetails(app.id)}
                        className="text-primary hover:underline text-sm font-semibold"
                      >
                        View Details
                      </button>
                    </td>
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
