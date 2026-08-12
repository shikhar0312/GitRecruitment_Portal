import React from 'react';

interface DashboardPriorityBreakdownProps {
  requirementsByPriority: Record<string, number>;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export const DashboardPriorityBreakdown: React.FC<DashboardPriorityBreakdownProps> = ({
  requirementsByPriority,
}) => {
  const entries = Object.entries(requirementsByPriority).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Open Requirements by Priority</h3>
      {!entries.length ? (
        <p className="text-sm text-on-surface-variant">No open requirements.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {entries.map(([priority, count]) => (
            <div key={priority} className="border border-outline-variant rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[priority] ?? 'bg-primary'}`} />
                <span className="text-xs font-semibold uppercase text-on-surface-variant">{priority}</span>
              </div>
              <div className="text-2xl font-bold text-on-surface">{count}</div>
              {total > 0 && (
                <div className="text-[10px] text-on-surface-variant">
                  {Math.round((count / total) * 100)}% of open reqs
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
