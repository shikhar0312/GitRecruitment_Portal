import React from 'react';

export const DashboardLoadingSkeleton: React.FC = () => (
  <div className="flex-1 overflow-y-auto space-y-gutter animate-pulse">
    <section className="flex flex-col gap-1">
      <div className="h-10 bg-surface-container w-1/3 rounded-md" />
      <div className="h-6 bg-surface-container w-1/2 rounded-md" />
    </section>
    {/* Margin-by-entity row (3 cards) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant h-40"
        />
      ))}
    </div>
    {/* Summary cards row (3 cards) */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant h-32"
        />
      ))}
    </div>
    {/* Margin-by-client + tracker tables */}
    <div className="bg-surface-container-lowest rounded-brand border border-outline-variant h-64" />
    <div className="bg-surface-container-lowest rounded-brand border border-outline-variant h-64" />
  </div>
);
