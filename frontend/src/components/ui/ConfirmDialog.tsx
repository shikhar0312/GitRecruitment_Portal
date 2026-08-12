import React from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  isPending = false,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-variant/10 rounded-md"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="px-4 py-2 bg-error text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
