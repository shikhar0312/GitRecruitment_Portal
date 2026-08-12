import React, { useState } from 'react';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';

interface CandidatesToolbarProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  showingCount: number;
  totalCount: number;
  onExportCsv: () => void;
  onClearFilters: () => void;
  onRefresh: () => void;
}

const statusOptions = [
  { value: '', label: 'Status: All Active' },
  { value: 'active', label: 'Active' },
  { value: 'placed', label: 'Placed' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blacklisted', label: 'Blacklisted' },
] as const;

export const CandidatesToolbar: React.FC<CandidatesToolbarProps> = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  showingCount,
  totalCount,
  onExportCsv,
  onClearFilters,
  onRefresh,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'export', label: 'Export to CSV', icon: 'download', onClick: onExportCsv },
    { id: 'refresh', label: 'Refresh list', icon: 'refresh', onClick: onRefresh },
    { id: 'clear', label: 'Clear filters', icon: 'filter_alt_off', onClick: onClearFilters },
  ];

  return (
    <section className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-wrap items-center gap-4 mb-6">
      <div className="flex-1 min-w-[200px] relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary transition-all text-body-md"
          placeholder="Search candidates..."
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border border-outline-variant rounded-lg bg-white min-w-[200px]">
        <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
        <select
          className="bg-transparent border-none outline-none text-on-surface-variant font-label-md cursor-pointer flex-1"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-on-surface-variant font-label-md mr-2">
          Showing {showingCount} of {totalCount}
        </span>
        <button
          type="button"
          onClick={onExportCsv}
          className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors"
          aria-label="Download CSV"
          title="Export candidates to CSV"
        >
          <span className="material-symbols-outlined text-on-surface-variant">download</span>
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors"
            aria-label="More options"
            aria-expanded={isMenuOpen}
          >
            <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
          </button>
          <DropdownMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            items={menuItems}
          />
        </div>
      </div>
    </section>
  );
};
