import React, { useEffect, useState } from 'react';
import { hasPermission } from '../../../lib/rbac';
import { useDebouncedValue } from '../../../lib/hooks/useDebouncedValue';
import { Pagination } from '../../../components/ui/Pagination';
import { useRequirements } from '../hooks/useRequirements';
import { RequirementsToolbar } from '../components/RequirementsToolbar';
import { RequirementsTable } from '../components/RequirementsTable';
import { RequirementFormModal } from '../components/RequirementFormModal';
import { RequirementDetailDrawer } from '../components/RequirementDetailDrawer';

export const RequirementsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [hiringType, setHiringType] = useState('');
  const [priority, setPriority] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, hiringType, priority, workMode, sortBy, sortOrder]);

  const { requirements, meta, isLoading, isError } = useRequirements({
    search: debouncedSearch,
    status,
    hiringType,
    priority,
    workMode,
    sortBy,
    sortOrder,
    page,
  });

  const handleViewDetails = (requirementId: string) => {
    setSelectedRequirementId(requirementId);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">Requirements</h2>
          <p className="font-body-md text-on-surface-variant">
            Manage and track candidate requirements for all enterprise customers.
          </p>
        </div>

        {hasPermission('create_requirement') && (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-semibold shadow-sm hover:opacity-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            Add Requirement
          </button>
        )}
      </div>

      <RequirementsToolbar
        search={search}
        status={status}
        hiringType={hiringType}
        priority={priority}
        workMode={workMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onHiringTypeChange={setHiringType}
        onAdvancedFiltersChange={({ priority: p, workMode: w, sortBy: sb, sortOrder: so }) => {
          setPriority(p);
          setWorkMode(w);
          setSortBy(sb);
          setSortOrder(so);
        }}
        onClearAdvancedFilters={() => {
          setPriority('');
          setWorkMode('');
          setSortBy('created_at');
          setSortOrder('desc');
        }}
      />

      <RequirementsTable
        requirements={requirements}
        page={page}
        pageSize={meta.limit}
        isLoading={isLoading}
        isError={isError}
        onViewDetails={handleViewDetails}
      />

      <Pagination page={page} meta={meta} onPageChange={setPage} />

      {isFormOpen && <RequirementFormModal onClose={() => setIsFormOpen(false)} />}

      <RequirementDetailDrawer
        requirementId={selectedRequirementId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};
