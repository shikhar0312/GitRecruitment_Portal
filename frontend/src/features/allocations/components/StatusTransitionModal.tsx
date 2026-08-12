import React, { useState } from 'react';
import type { AllocationStatus } from '../../../lib/status-machine';
import { ALLOCATION_STATUS_LABELS } from '../../../lib/status-machine';
import type { StatusTransitionFormValues } from '../../../schemas/allocation.schema';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';

interface StatusTransitionModalProps {
  targetStatus: 'rejected' | 'offered' | 'placed';
  isPending: boolean;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: (values: StatusTransitionFormValues) => void;
}

export const StatusTransitionModal: React.FC<StatusTransitionModalProps> = ({
  targetStatus,
  isPending,
  errorMessage = '',
  onClose,
  onConfirm,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [placedDate, setPlacedDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (targetStatus === 'rejected' && !rejectionReason.trim()) {
      setValidationError('Rejection reason is required');
      return;
    }
    if (targetStatus === 'offered' && !offerDate) {
      setValidationError('Offer date is required');
      return;
    }
    if (targetStatus === 'placed' && !placedDate) {
      setValidationError('Placed date is required');
      return;
    }

    onConfirm({
      rejection_reason: rejectionReason,
      offer_date: offerDate,
      placed_date: placedDate,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6 border-b border-outline-variant">
          <h2 className="font-headline-sm text-headline-sm">
            Confirm Status: {ALLOCATION_STATUS_LABELS[targetStatus as AllocationStatus]}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ErrorAlert message={validationError || errorMessage} />

          {targetStatus === 'rejected' && (
            <div>
              <label className="block text-sm font-medium mb-1">Rejection Reason *</label>
              <textarea
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-md h-24 resize-none"
                placeholder="Why was this candidate rejected?"
              />
            </div>
          )}

          {targetStatus === 'offered' && (
            <div>
              <label className="block text-sm font-medium mb-1">Offer Date *</label>
              <input
                type="date"
                required
                value={offerDate}
                onChange={(e) => setOfferDate(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-md"
              />
            </div>
          )}

          {targetStatus === 'placed' && (
            <div>
              <label className="block text-sm font-medium mb-1">Placed Date *</label>
              <input
                type="date"
                required
                value={placedDate}
                onChange={(e) => setPlacedDate(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-md"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-on-surface-variant font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-md disabled:opacity-50"
            >
              {isPending ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
