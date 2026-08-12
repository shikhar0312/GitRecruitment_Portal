import React from 'react';
import type { PaginationMeta } from '../../api/types/api.types';

interface PaginationProps {
  page: number;
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, meta, onPageChange }) => (
  <div className="mt-6 flex items-center justify-between text-body-sm text-on-surface-variant">
    <div>
      Showing {meta.total === 0 ? 0 : (page - 1) * meta.limit + 1} to{' '}
      {Math.min(page * meta.limit, meta.total)} of {meta.total} entries
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="p-2 border border-outline-variant rounded-lg hover:bg-surface-variant/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>
      <span className="px-3 py-1 border border-primary bg-primary/10 text-primary rounded-lg font-bold">
        {page}
      </span>
      <button
        type="button"
        className="p-2 border border-outline-variant rounded-lg hover:bg-surface-variant/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= meta.totalPages}
        aria-label="Next page"
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  </div>
);
