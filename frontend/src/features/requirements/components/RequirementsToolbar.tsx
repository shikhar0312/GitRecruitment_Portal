import React, { useEffect, useRef, useState } from 'react';

interface AdvancedFilters {
  priority: string;
  workMode: string;
  sortBy: string;
  sortOrder: string;
}

interface RequirementsToolbarProps {
  search: string;
  status: string;
  hiringType: string;
  priority: string;
  workMode: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onHiringTypeChange: (value: string) => void;
  onAdvancedFiltersChange: (filters: AdvancedFilters) => void;
  onClearAdvancedFilters: () => void;
}

export const RequirementsToolbar: React.FC<RequirementsToolbarProps> = ({
  search,
  status,
  hiringType,
  priority,
  workMode,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onHiringTypeChange,
  onAdvancedFiltersChange,
  onClearAdvancedFilters,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeAdvancedCount = [priority, workMode, sortBy !== 'created_at' ? sortBy : '', sortOrder !== 'desc' ? sortOrder : ''].filter(Boolean).length;

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isFilterOpen]);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 mb-6 flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[300px] relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary transition-all text-body-md"
          placeholder="Search by Requirement, Customer or ID..."
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            className="appearance-none bg-white border border-outline-variant rounded-lg pl-4 pr-10 py-2 text-body-md focus:ring-2 focus:ring-primary-container/20 focus:border-primary cursor-pointer"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">Status: All</option>
            <option value="open">Open</option>
            <option value="on_hold">On Hold</option>
            <option value="filled">Filled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
            expand_more
          </span>
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-white border border-outline-variant rounded-lg pl-4 pr-10 py-2 text-body-md focus:ring-2 focus:ring-primary-container/20 focus:border-primary cursor-pointer"
            value={hiringType}
            onChange={(e) => onHiringTypeChange(e.target.value)}
          >
            <option value="">Hiring Type: All</option>
            <option value="permanent">Permanent</option>
            <option value="contract">Contract</option>
            <option value="fixed_term">Fixed Term</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
            expand_more
          </span>
        </div>
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen((open) => !open)}
            className={`relative p-2 border rounded-lg transition-colors ${
              isFilterOpen || activeAdvancedCount > 0
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-outline-variant hover:bg-surface-container text-on-surface-variant'
            }`}
            title="More Filters"
            aria-expanded={isFilterOpen}
          >
            <span className="material-symbols-outlined">filter_list</span>
            {activeAdvancedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeAdvancedCount}
              </span>
            )}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-outline-variant rounded-xl shadow-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-on-surface">Advanced Filters</h4>
                {activeAdvancedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearAdvancedFilters();
                      setIsFilterOpen(false);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Priority</label>
                <select
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                  value={priority}
                  onChange={(e) => onAdvancedFiltersChange({ priority: e.target.value, workMode, sortBy, sortOrder })}
                >
                  <option value="">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Work Mode</label>
                <select
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                  value={workMode}
                  onChange={(e) => onAdvancedFiltersChange({ priority, workMode: e.target.value, sortBy, sortOrder })}
                >
                  <option value="">All modes</option>
                  <option value="onsite">Onsite</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Sort By</label>
                <select
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                  value={sortBy}
                  onChange={(e) => onAdvancedFiltersChange({ priority, workMode, sortBy: e.target.value, sortOrder })}
                >
                  <option value="created_at">Created Date</option>
                  <option value="priority">Priority</option>
                  <option value="expected_start_date">Start Date</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Sort Order</label>
                <select
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
                  value={sortOrder}
                  onChange={(e) => onAdvancedFiltersChange({ priority, workMode, sortBy, sortOrder: e.target.value })}
                >
                  <option value="desc">Newest / Highest first</option>
                  <option value="asc">Oldest / Lowest first</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
