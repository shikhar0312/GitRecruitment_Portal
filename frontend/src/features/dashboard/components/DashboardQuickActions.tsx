import React from 'react';
import { useNavigate } from 'react-router-dom';

const quickActions = [
  {
    icon: 'add_business',
    title: 'Add Requirement',
    description: 'Configure a new candidate demand for a customer.',
    path: '/requirements',
  },
  {
    icon: 'person_add',
    title: 'Add Candidate',
    description: 'Import new engineering profiles to your bench.',
    path: '/candidates',
  },
  {
    icon: 'post_add',
    title: 'Add Allocation',
    description: 'Directly link a candidate to an active requirement.',
    path: '/allocations',
  },
  {
    icon: 'corporate_fare',
    title: 'Add Customer',
    description: 'Register a new enterprise partner or subsidiary.',
    path: '/customers',
  },
] as const;

export const DashboardQuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-md text-headline-md text-on-surface">Quick Actions</h2>
        <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/5 rounded-full uppercase tracking-widest">
          Efficiency Tools
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {quickActions.map((action) => (
          <button
            key={action.path}
            type="button"
            onClick={() => navigate(action.path)}
            className="bg-surface-container-lowest p-6 rounded-brand border border-outline-variant custom-shadow-l1 hover:shadow-md hover:border-primary-container transition-all text-left flex flex-col gap-4 group"
          >
            <div className="w-12 h-12 rounded-brand bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-standard">
              <span className="material-symbols-outlined">{action.icon}</span>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface">{action.title}</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
