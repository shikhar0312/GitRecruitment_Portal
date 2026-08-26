import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { DashboardLoadingSkeleton } from '../components/DashboardLoadingSkeleton';
import { DashboardSummaryCards } from '../components/DashboardSummaryCards';
import { DashboardMarginByEntity } from '../components/DashboardMarginByEntity';
import { DashboardMarginByClient } from '../components/DashboardMarginByClient';
import { DashboardTrackerPreview } from '../components/DashboardTrackerPreview';

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
    <div className="max-w-[1400px]">
      <section className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Business Overview</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Clients, placements, and margin across all three GIT entities — at a glance.
        </p>
      </section>

      {/* Quick context strip: headline counts, kept slim and secondary. */}
      <div className="mt-6">
        <DashboardSummaryCards summary={summary} />
      </div>

      {/* Money, most prominent — what each entity and each client earns. */}
      <DashboardMarginByEntity entities={data?.margin_by_entity ?? null} />
      <DashboardMarginByClient clients={data?.margin_by_client ?? null} />

      {/* Detail / drill-down: the individual placements behind the numbers. */}
      <DashboardTrackerPreview records={data?.recent_tracker ?? null} />
    </div>
  );
};
