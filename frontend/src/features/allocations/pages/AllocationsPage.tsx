import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hasPermission } from '../../../lib/rbac';
import { Pagination } from '../../../components/ui/Pagination';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import { getApiErrorMessage } from '../../../lib/errors';
import type { AllocationStatus } from '../../../lib/status-machine';
import { toStatusTransitionPayload, type StatusTransitionFormValues } from '../../../schemas/allocation.schema';
import { useAllocations } from '../hooks/useAllocations';
import { useUpdateAllocationStatus } from '../hooks/useUpdateAllocationStatus';
import { AllocationsToolbar } from '../components/AllocationsToolbar';
import { AllocationsTable } from '../components/AllocationsTable';
import { AllocationFormModal } from '../components/AllocationFormModal';
import { AllocationDetailDrawer } from '../components/AllocationDetailDrawer';
import { StatusTransitionModal } from '../components/StatusTransitionModal';

const STATUSES_REQUIRING_MODAL = new Set<AllocationStatus>(['rejected', 'offered', 'placed']);

export const AllocationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [selectedAllocationId, setSelectedAllocationId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [prefillCandidateId, setPrefillCandidateId] = useState('');
  const [prefillRequirementId, setPrefillRequirementId] = useState('');
  const [prefillCustomerId, setPrefillCustomerId] = useState('');
  const [pendingTransition, setPendingTransition] = useState<{
    id: string;
    status: 'rejected' | 'offered' | 'placed';
  } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [status]);

  useEffect(() => {
    const candidateId = searchParams.get('candidateId');
    const requirementId = searchParams.get('requirementId');
    const customerId = searchParams.get('customerId');
    const action = searchParams.get('action');
    if (candidateId || requirementId) {
      setPrefillCandidateId(candidateId ?? '');
      setPrefillRequirementId(requirementId ?? '');
      setPrefillCustomerId(customerId ?? '');
      setIsFormOpen(true);
      setSearchParams({}, { replace: true });
    } else if (action === 'create') {
      setIsFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { allocations, meta, isLoading, isError } = useAllocations({ status, page });
  const updateStatus = useUpdateAllocationStatus();

  const submitStatusUpdate = (id: string, input: { status: AllocationStatus; rejection_reason?: string; offer_date?: string; placed_date?: string }) => {
    setStatusUpdateError('');
    updateStatus.mutate(
      { id, input },
      {
        onSuccess: () => setPendingTransition(null),
        onError: (error) => {
          setStatusUpdateError(getApiErrorMessage(error, 'Failed to update allocation status'));
        },
      }
    );
  };

  const handleStatusChange = (id: string, nextStatus: AllocationStatus) => {
    if (STATUSES_REQUIRING_MODAL.has(nextStatus)) {
      setPendingTransition({ id, status: nextStatus as 'rejected' | 'offered' | 'placed' });
      return;
    }
    submitStatusUpdate(id, { status: nextStatus });
  };

  const handleTransitionConfirm = (values: StatusTransitionFormValues) => {
    if (!pendingTransition) return;
    const payload = toStatusTransitionPayload(pendingTransition.status, values);
    submitStatusUpdate(pendingTransition.id, payload as { status: AllocationStatus; rejection_reason?: string; offer_date?: string; placed_date?: string });
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col h-full relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Allocation Board</h2>
          <p className="font-body-md text-on-surface-variant mt-1">
            Manage active candidate allocations and assignment stages.
          </p>
        </div>
        {hasPermission('create_allocation') && (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label-md text-label-md font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">post_add</span>
            New Allocation
          </button>
        )}
      </div>

      {statusUpdateError && <ErrorAlert message={statusUpdateError} className="mb-4" />}

      <AllocationsToolbar status={status} onStatusChange={setStatus} showingCount={allocations.length} totalCount={meta.total} />

      <AllocationsTable
        allocations={allocations}
        isLoading={isLoading}
        isError={isError}
        isUpdating={updateStatus.isPending}
        onStatusChange={handleStatusChange}
        onViewDetails={(id) => {
          setSelectedAllocationId(id);
          setIsDetailOpen(true);
        }}
      />

      <Pagination page={page} meta={meta} onPageChange={setPage} />

      {isFormOpen && (
        <AllocationFormModal
          onClose={() => {
            setIsFormOpen(false);
            setPrefillCandidateId('');
            setPrefillRequirementId('');
            setPrefillCustomerId('');
          }}
          initialCandidateId={prefillCandidateId}
          initialRequirementId={prefillRequirementId}
          initialCustomerId={prefillCustomerId}
        />
      )}

      <AllocationDetailDrawer
        allocationId={selectedAllocationId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {pendingTransition && (
        <StatusTransitionModal
          targetStatus={pendingTransition.status}
          isPending={updateStatus.isPending}
          onClose={() => setPendingTransition(null)}
          onConfirm={handleTransitionConfirm}
        />
      )}
    </div>
  );
};
