import React from 'react';
import {
  ALL_ALLOCATION_STATUSES,
  ALLOCATION_STATUS_LABELS,
  type AllocationStatus,
} from '../../../lib/status-machine';

interface AllocationsToolbarProps {
  status: string;
  onStatusChange: (value: string) => void;
  showingCount: number;
  totalCount: number;
}

export const AllocationsToolbar: React.FC<AllocationsToolbarProps> = ({
  status,
  onStatusChange,
  showingCount,
  totalCount,
}) => (
  <section className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-wrap items-center gap-4 mb-6">
    <div className="flex items-center gap-2 px-3 py-2 border border-outline-variant rounded-lg bg-white min-w-[200px]">
      <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
      <select
        className="bg-transparent border-none outline-none text-on-surface-variant font-label-md cursor-pointer flex-1"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">Status: All Stages</option>
        {ALL_ALLOCATION_STATUSES.map((value) => (
          <option key={value} value={value}>
            {ALLOCATION_STATUS_LABELS[value as AllocationStatus]}
          </option>
        ))}
      </select>
    </div>
    <div className="ml-auto flex items-center gap-2 text-on-surface-variant text-sm">
      Showing {showingCount} of {totalCount}
    </div>
  </section>
);
