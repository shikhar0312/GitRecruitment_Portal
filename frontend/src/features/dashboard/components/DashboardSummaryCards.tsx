import React from 'react';
import type { DashboardSummary } from '../../../types/dashboard.types';

interface DashboardSummaryCardsProps {
  summary: DashboardSummary;
}

export const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({ summary }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-gutter mb-6">
    <div className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant custom-shadow-l1 flex flex-col gap-4 group hover:border-primary/30 transition-standard">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-primary/5 text-primary rounded-xl">
          <span className="material-symbols-outlined">domain</span>
        </div>
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          LIVE
        </span>
      </div>
      <div>
        <div className="text-display-lg font-display-lg text-on-surface group-hover:text-primary transition-standard">
          {summary.total_customers}
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant">Total Customers</div>
      </div>
    </div>

    <div className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant custom-shadow-l1 flex flex-col gap-4 group hover:border-primary/30 transition-standard">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-primary/5 text-primary rounded-xl">
          <span className="material-symbols-outlined">assignment</span>
        </div>
      </div>
      <div>
        <div className="text-display-lg font-display-lg text-on-surface group-hover:text-primary transition-standard">
          {summary.total_active_requirements}
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant">Open Requirements</div>
      </div>
    </div>

    <div className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant custom-shadow-l1 flex flex-col gap-4 group hover:border-primary/30 transition-standard">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-primary/5 text-primary rounded-xl">
          <span className="material-symbols-outlined">badge</span>
        </div>
      </div>
      <div>
        <div className="text-display-lg font-display-lg text-on-surface group-hover:text-primary transition-standard">
          {summary.total_candidates}
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant">Available Candidates</div>
      </div>
    </div>

    <div className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant custom-shadow-l1 flex flex-col gap-4 group hover:border-primary/30 transition-standard">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-primary/5 text-primary rounded-xl">
          <span className="material-symbols-outlined">trending_up</span>
        </div>
      </div>
      <div>
        <div className="text-display-lg font-display-lg text-on-surface group-hover:text-primary transition-standard">
          {summary.allocations_this_month}
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant">This Month</div>
      </div>
    </div>

    <div className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant custom-shadow-l1 flex flex-col gap-4 group hover:border-primary/30 transition-standard">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-primary/5 text-primary rounded-xl">
          <span className="material-symbols-outlined">account_tree</span>
        </div>
      </div>
      <div>
        <div className="text-display-lg font-display-lg text-on-surface group-hover:text-primary transition-standard">
          {summary.total_placed}
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant">Placed Allocations</div>
      </div>
    </div>
  </div>
);
