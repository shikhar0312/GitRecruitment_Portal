import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardLoadingSkeleton } from '../components/DashboardLoadingSkeleton';
import { DashboardSummaryCards } from '../components/DashboardSummaryCards';
import { DashboardQuickActions } from '../components/DashboardQuickActions';
import { DashboardAllocationsChart } from '../components/DashboardAllocationsChart';
import { DashboardPriorityBreakdown } from '../components/DashboardPriorityBreakdown';
import { DashboardRecentAllocations } from '../components/DashboardRecentAllocations';
import { DashboardMarginByEntity } from '../components/DashboardMarginByEntity';

const emptySummary = {
  total_active_requirements: 0,
  total_candidates: 0,
  allocations_this_month: 0,
  total_placed: 0,
  total_customers: 0,
};

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-error">
        Failed to load dashboard data.
      </div>
    );
  }

  const summary = data?.summary ?? emptySummary;

  return (
    <>
      <section className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Candidate Management Overview
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Track your candidate allocations and enterprise bench metrics in real-time.
        </p>
      </section>

      <DashboardSummaryCards summary={summary} />
      <DashboardQuickActions />
      <DashboardMarginByEntity entities={data?.margin_by_entity ?? null} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mt-6">
        <DashboardAllocationsChart
          allocationsByStatus={data?.allocations_by_status ?? {}}
        />
        <DashboardPriorityBreakdown
          requirementsByPriority={data?.requirements_by_priority ?? {}}
        />
        <DashboardRecentAllocations
          allocations={data?.recent_allocations ?? []}
        />
      </div>
    </>
  );
};
