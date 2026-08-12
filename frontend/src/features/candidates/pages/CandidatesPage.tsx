import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { hasPermission } from '../../../lib/rbac';
import { useDebouncedValue } from '../../../lib/hooks/useDebouncedValue';
import { exportCandidatesToCsv } from '../../../lib/candidate-export';
import { queryKeys } from '../../../lib/query-keys';
import { Pagination } from '../../../components/ui/Pagination';
import { getCandidateById } from '../../../api/services/candidates.service';
import { useCandidates } from '../hooks/useCandidates';
import { CandidatesToolbar } from '../components/CandidatesToolbar';
import { CandidatesTable } from '../components/CandidatesTable';
import { CandidateFormModal } from '../components/CandidateFormModal';
import { AddCandidateModal } from '../components/AddCandidateModal';
import { CandidateDrawer } from '../components/CandidateDrawer';
import type { Candidate } from '../../../types/candidate.types';

export const CandidatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setShowAddModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const { candidates, meta, isLoading, isError } = useCandidates({
    search: debouncedSearch,
    status,
    page,
  });

  const handleRowClick = (candidate: Candidate) => {
    setSelectedCandidateId(candidate.id);
    setIsDrawerOpen(true);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
  };

  const handleExportCsv = () => {
    if (candidates.length === 0) return;
    exportCandidatesToCsv(candidates);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col h-full relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Candidates</h2>
          <nav className="flex text-on-surface-variant font-label-md text-label-md mt-1">
            <span className="hover:text-primary cursor-pointer">Candidate Management</span>
            <span className="mx-2">/</span>
            <span>Active Bench</span>
          </nav>
        </div>
        {hasPermission('create_candidate') && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label-md text-label-md font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined">person_add</span>
            Add Candidate
          </button>
        )}
      </div>

      <CandidatesToolbar
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        showingCount={candidates.length}
        totalCount={meta.total}
        onExportCsv={handleExportCsv}
        onClearFilters={handleClearFilters}
        onRefresh={handleRefresh}
      />

      <CandidatesTable
        candidates={candidates}
        isLoading={isLoading}
        isError={isError}
        onClearFilters={handleClearFilters}
        onRowClick={handleRowClick}
      />

      <Pagination page={page} meta={meta} onPageChange={setPage} />

      <CandidateDrawer
        candidateId={selectedCandidateId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={async () => {
          if (!selectedCandidateId) return;
          setIsDrawerOpen(false);
          const detail = await queryClient.fetchQuery({
            queryKey: queryKeys.candidates.detail(selectedCandidateId),
            queryFn: () => getCandidateById(selectedCandidateId),
          });
          setEditingCandidate(detail);
          setIsFormOpen(true);
        }}
      />

      {isFormOpen && (
        <CandidateFormModal
          onClose={() => { setIsFormOpen(false); setEditingCandidate(null); }}
          candidate={editingCandidate ?? undefined}
        />
      )}

      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};
