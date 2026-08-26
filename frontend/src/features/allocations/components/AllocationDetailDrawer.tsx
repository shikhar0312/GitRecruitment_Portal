import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import { hasPermission } from '../../../lib/rbac';
import { ALLOCATION_STATUS_LABELS } from '../../../lib/status-machine';
import { formatDate, formatUnderscoreLabel } from '../../../lib/formatters';
import { getApiErrorMessage } from '../../../lib/errors';
import { queryKeys } from '../../../lib/query-keys';
import {
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
} from '../../../api/services/allocations.service';
import {
  toInterviewRoundPayload,
  type InterviewRoundFormValues,
} from '../../../schemas/allocation.schema';
import type { InterviewRound } from '../../../types/allocation.types';
import { useAllocationDetail } from '../hooks/useAllocationDetail';
import { useRecalculateMatchScore } from '../hooks/useRecalculateMatchScore';
import {
  InterviewRoundFormModal,
  interviewRoundToFormValues,
} from './InterviewRoundFormModal';

interface AllocationDetailDrawerProps {
  allocationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AllocationDetailDrawer: React.FC<AllocationDetailDrawerProps> = ({
  allocationId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { data: allocation, isLoading, isError } = useAllocationDetail(allocationId);
  const recalculate = useRecalculateMatchScore(allocationId);
  const [error, setError] = useState('');
  const [roundModal, setRoundModal] = useState<{
    mode: 'create' | 'edit';
    round: InterviewRound | null;
  } | null>(null);

  const saveRound = useMutation({
    mutationFn: async ({
      mode,
      round,
      values,
    }: {
      mode: 'create' | 'edit';
      round: InterviewRound | null;
      values: InterviewRoundFormValues;
    }) => {
      if (!allocation) throw new Error('Allocation not loaded');
      const payload = toInterviewRoundPayload(values);
      if (mode === 'create') {
        return addInterviewRound(allocation.id, payload);
      }
      return updateInterviewRound(allocation.id, round!.id, payload);
    },
    onSuccess: () => {
      if (allocation) {
        queryClient.invalidateQueries({ queryKey: queryKeys.allocations.detail(allocation.id) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all });
      setRoundModal(null);
      setError('');
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, 'Failed to save interview round'));
    },
  });

  const deleteRound = useMutation({
    mutationFn: async (roundId: string) => {
      if (!allocation) throw new Error('Allocation not loaded')
      return deleteInterviewRound(allocation.id, roundId)
    },
    onSuccess: () => {
      if (allocation) {
        queryClient.invalidateQueries({ queryKey: queryKeys.allocations.detail(allocation.id) })
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.all })
      setError('')
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, 'Failed to delete interview round'))
    },
  })

  if (!isOpen || !allocationId) return null;

  const handleRecalculate = () => {
    recalculate.mutate(undefined, {
      onError: (err) => setError(getApiErrorMessage(err, 'Failed to recalculate match score')),
    });
  };

  // useEffect(() => {
  //   setError('')
  // }, [allocationId])

  const displayScore = recalculate.data?.match_score ?? allocation?.match_score ?? 0;
  const nextRoundNumber = (allocation?.interview_rounds?.length ?? 0) + 1;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={onClose} role="presentation" />
      <aside className="fixed right-0 top-0 h-screen w-full sm:w-[640px] bg-white shadow-2xl z-[70] flex flex-col border-l border-outline-variant">
        <div className="p-6 border-b border-outline-variant flex justify-between items-start">
          <div>
            <h3 className="font-headline-md text-headline-md">Allocation Details</h3>
            <p className="font-body-sm text-on-surface-variant mt-1">
              {allocation?.candidate?.full_name ?? 'Loading...'}
            </p>
          </div>
          <button type="button" className="p-2 hover:bg-surface-container-low rounded-full" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <LoadingState />
          ) : isError || !allocation ? (
            <p className="text-error text-center">Failed to load allocation details.</p>
          ) : (
            <>
              {error && <ErrorAlert message={error} />}

              <section className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase">Candidate</span>
                  <span className="font-semibold">{allocation.candidate?.full_name}</span>
                  <div className="text-xs text-on-surface-variant">{allocation.candidate?.email}</div>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase">Requirement</span>
                  <span className="font-semibold">{allocation.requirement?.role?.title}</span>
                  <div className="text-xs text-on-surface-variant">{allocation.requirement?.customer?.name}</div>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase">Status</span>
                  <span className="font-semibold">{ALLOCATION_STATUS_LABELS[allocation.status]}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase">Match Score</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{displayScore}%</span>
                    {hasPermission('edit_allocation') && (
                      <button
                        type="button"
                        onClick={handleRecalculate}
                        disabled={recalculate.isPending}
                        className="text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        {recalculate.isPending ? 'Recalculating...' : 'Refresh'}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase">Allocated On</span>
                  <span>{formatDate(allocation.applied_at)}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase">Location</span>
                  <span>{allocation.requirement?.location ?? 'N/A'}</span>
                </div>
              </section>

              {allocation.notes && (
                <section>
                  <h4 className="font-bold text-on-surface mb-2">Notes</h4>
                  <p className="text-sm text-on-surface-variant">{allocation.notes}</p>
                </section>
              )}

              {allocation.rejection_reason && (
                <section>
                  <h4 className="font-bold text-on-surface mb-2">Rejection Reason</h4>
                  <p className="text-sm text-error">{allocation.rejection_reason}</p>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-on-surface">Interview Rounds</h4>
                  {hasPermission('edit_allocation') && (
                    <button
                      type="button"
                      onClick={() => setRoundModal({ mode: 'create', round: null })}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      + Schedule Round
                    </button>
                  )}
                </div>
                {!allocation.interview_rounds?.length ? (
                  <p className="text-sm text-on-surface-variant bg-surface-container-low rounded-lg p-4">
                    No interview rounds scheduled yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {allocation.interview_rounds.map((round) => (
                      <div key={round.id} className="border border-outline-variant rounded-lg p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">
                            Round {round.round_number}: {formatUnderscoreLabel(round.round_type)}
                          </span>
                          <div className="flex items-center gap-2">
                            {round.outcome && (
                              <span className="text-xs capitalize px-2 py-0.5 bg-surface-container-low rounded-full">
                                {formatUnderscoreLabel(round.outcome)}
                              </span>
                            )}
                            {hasPermission('edit_allocation') && (
                              <button
                                type="button"
                                onClick={() => setRoundModal({ mode: 'edit', round })}
                                className="text-xs text-primary hover:underline"
                              >
                                Edit
                              </button>
                            )}
                            {hasPermission('edit_allocation') && !round.outcome && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Delete this interview round?')) {
                                    deleteRound.mutate(round.id)
                                  }
                                }}
                                className="text-xs text-error hover:underline"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        {round.scheduled_at && (
                          <div className="text-xs text-on-surface-variant mt-1">
                            Scheduled: {new Date(round.scheduled_at).toLocaleString()}
                          </div>
                        )}
                        {round.conducted_by && (
                          <div className="text-xs text-on-surface-variant">
                            Interviewer: {round.conducted_by}
                          </div>
                        )}
                        {round.mode && (
                          <div className="text-xs text-on-surface-variant capitalize">Mode: {round.mode}</div>
                        )}
                        {round.feedback && (
                          <p className="text-sm text-on-surface-variant mt-2">{round.feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </aside>

      {roundModal && allocation && (
        <InterviewRoundFormModal
          mode={roundModal.mode}
          initialValues={interviewRoundToFormValues(roundModal.round, nextRoundNumber)}
          isPending={saveRound.isPending}
          errorMessage={saveRound.isError ? error : ''}
          onClose={() => setRoundModal(null)}
          onSubmit={(values) => saveRound.mutate({ mode: roundModal.mode, round: roundModal.round, values })}
        />
      )}
    </>
  );
};
