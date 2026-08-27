import React from 'react';
import type { DashboardSummary } from '../../../types/dashboard.types';

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

// A slim strip of headline counts rather than large cards — these are
// supporting context (how many clients / placements / open roles), not the
// main story, so they stay compact and out of the way of the money views.
const stats = [
  { icon: 'domain', label: 'Clients we work with', key: 'total_customers' },
  { icon: 'account_tree', label: 'People placed', key: 'total_placed' },
  { icon: 'assignment', label: 'Roles to fill', key: 'total_active_requirements' },
] as const;

export const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({ summary }) => (
  <div className="flex flex-wrap gap-3">
    {stats.map((stat) => (
      <div
        key={stat.key}
        className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl px-5 py-3 flex-1 min-w-[200px]"
      >
        <div className="p-2 bg-primary/5 text-primary rounded-lg shrink-0">
          <span className="material-symbols-outlined">{stat.icon}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-on-surface leading-none">
            {summary[stat.key]}
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant">{stat.label}</span>
        </div>
      </div>
    ))}
  </div>
);
