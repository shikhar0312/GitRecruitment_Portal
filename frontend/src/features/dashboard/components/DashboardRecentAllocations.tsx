import React from 'react';
import { ALLOCATION_STATUS_LABELS, type AllocationStatus } from '../../../lib/status-machine';
import type { DashboardRecentAllocation } from '../../../types/dashboard.types';

interface DashboardRecentAllocationsProps {
  allocations: DashboardRecentAllocation[];
}

export const DashboardRecentAllocations: React.FC<DashboardRecentAllocationsProps> = ({
  allocations,
}) => (
  <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Recent Allocations</h3>
    {!allocations.length ? (
      <p className="text-sm text-on-surface-variant">No recent allocations.</p>
    ) : (
      <div className="space-y-3">
        {allocations.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between border border-outline-variant/50 rounded-lg px-4 py-3"
          >
            <div>
              <div className="font-semibold text-sm text-on-surface">
                {app.candidate?.full_name ?? 'Unknown'}
              </div>
              <div className="text-xs text-on-surface-variant">
                {app.requirement?.role?.title} at {app.requirement?.customer?.name}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold capitalize px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                {ALLOCATION_STATUS_LABELS[app.status as AllocationStatus] ?? app.status}
              </span>
              {app.match_score != null && (
                <div className="text-[10px] text-on-surface-variant mt-1">{app.match_score}% match</div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);
