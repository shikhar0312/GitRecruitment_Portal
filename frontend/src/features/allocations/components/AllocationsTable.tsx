import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { hasPermission } from '../../../lib/rbac';
import { getAvatarStyle, getInitials } from '../../../lib/avatar';
import {
  ALLOCATION_STATUS_LABELS,
  ALLOCATION_PIPELINE,
  getAllowedNextStatuses,
  getSelectableStatuses,
  getPipelineIndex,
  isOffRamp,
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

function matchScoreColor(score: number) {
  if (score > 70) return '#2e7d55';
  if (score > 40) return '#b7791f';
  return '#c0392b';
}

// A five-dot track showing how far an allocation has moved down the pipeline.
// Filled = passed, ringed = current; off-ramp (rejected/withdrawn) shows a
// single muted marker instead of the track.
const PipelineTrack: React.FC<{ status: AllocationStatus }> = ({ status }) => {
  if (isOffRamp(status)) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
        <span className="text-xs font-semibold text-gray-500 capitalize">{status}</span>
      </span>
    );
  }
  const currentIndex = getPipelineIndex(status);
  return (
    <span className="inline-flex items-center">
      {ALLOCATION_PIPELINE.map((stage, i) => {
        const passed = i < currentIndex;
        const isCurrent = i === currentIndex;
        const dotColor = passed || isCurrent ? '#2e7d55' : 'var(--tw-line, #d7c3ad)';
        return (
          <React.Fragment key={stage}>
            <span
              className="rounded-full shrink-0"
              style={{
                width: isCurrent ? 9 : 7,
                height: isCurrent ? 9 : 7,
                backgroundColor: passed || isCurrent ? '#2e7d55' : '#d7c3ad',
                boxShadow: isCurrent ? '0 0 0 3px rgba(46,125,85,0.18)' : 'none',
              }}
              title={ALLOCATION_STATUS_LABELS[stage]}
            />
            {i < ALLOCATION_PIPELINE.length - 1 && (
              <span
                className="h-0.5"
                style={{ width: 18, backgroundColor: i < currentIndex ? '#2e7d55' : '#e0d6c6' }}
              />
            )}
          </React.Fragment>
        );
      })}
      <span className="text-xs font-semibold text-on-surface ml-2.5 whitespace-nowrap">
        {ALLOCATION_STATUS_LABELS[status]}
      </span>
    </span>
  );
};

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
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low/30">
              <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Candidate → Role</th>
              <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Allocated</th>
              <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Match</th>
              <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Stage</th>
              <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Move to</th>
              <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6}><LoadingState /></td></tr>
            ) : isError ? (
              <tr><td colSpan={6} className="p-8 text-center text-error">Failed to load allocations</td></tr>
            ) : allocations.length === 0 ? (
              <tr>
                <td className="py-32" colSpan={6}>
                  <div className="flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-5">
                      <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>account_tree</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">No allocations yet</h3>
                    <p className="font-body-md text-on-surface-variant max-w-sm">
                      Allocate a candidate to a requirement to start tracking the pipeline.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              allocations.map((app) => {
                const currentStatus = app.status as AllocationStatus;
                const selectable = getSelectableStatuses(currentStatus);
                const isTerminal = getAllowedNextStatuses(currentStatus).length === 0;
                const score = app.match_score ?? 0;
                const avatar = getAvatarStyle(app.candidate?.full_name ?? '?');

                return (
                  <tr
                    key={app.id}
                    className="group border-b border-outline-variant/50 hover:bg-surface-variant/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0"
                          style={{ backgroundColor: avatar.bg, color: avatar.fg }}
                          aria-hidden="true"
                        >
                          {getInitials(app.candidate?.full_name ?? '?')}
                        </span>
                        <div>
                          <div className="font-body-md font-semibold text-on-surface">
                            {app.candidate?.full_name}
                          </div>
                          <div className="text-xs text-on-surface-variant mt-0.5">
                            {app.requirement?.role?.title || 'Unknown Role'} ·{' '}
                            {app.requirement?.customer?.name || 'Unknown Client'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body-md text-on-surface-variant text-sm">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${score}%`, backgroundColor: matchScoreColor(score) }}
                          />
                        </div>
                        <span className="text-sm font-semibold tabular-nums">{score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PipelineTrack status={currentStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="bg-transparent border border-outline-variant rounded-lg px-2.5 py-1.5 text-sm outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
                        value={currentStatus}
                        onChange={(e) => onStatusChange(app.id, e.target.value as AllocationStatus)}
                        disabled={!canEdit || isUpdating || isTerminal}
                        title={isTerminal ? 'No further status changes allowed' : 'Select next stage'}
                      >
                        {selectable.map((status) => (
                          <option key={status} value={status}>
                            {ALLOCATION_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onViewDetails(app.id)}
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
    </section>
  );
};
