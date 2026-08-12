import React from 'react';

interface CustomersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  showingCount: number;
  totalCount: number;
}

export const CustomersToolbar: React.FC<CustomersToolbarProps> = ({
  search,
  onSearchChange,
  showingCount,
  totalCount,
}) => (
  <section className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-wrap items-center gap-4 mb-6">
    <div className="flex-1 min-w-[300px] relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
        search
      </span>
      <input
        className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary transition-all text-body-md"
        placeholder="Search customers..."
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    <div className="ml-auto flex items-center gap-2 text-on-surface-variant text-sm">
      Showing {showingCount} of {totalCount}
    </div>
  </section>
);
