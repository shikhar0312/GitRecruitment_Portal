import React from 'react';

export const DashboardLoadingSkeleton: React.FC = () => (
  <div className="flex-1 overflow-y-auto space-y-gutter animate-pulse">
    <section className="flex flex-col gap-1">
      <div className="h-10 bg-surface-container w-1/3 rounded-md" />
      <div className="h-6 bg-surface-container w-1/2 rounded-md" />
    </section>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant h-32"
        />
      ))}
    </div>
  </div>
);
