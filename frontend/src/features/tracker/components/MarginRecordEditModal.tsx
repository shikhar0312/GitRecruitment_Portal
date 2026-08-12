import React, { useState } from 'react';
import {
  updateMarginRecordFormSchema,
  type UpdateMarginRecordFormInput,
} from '../../../schemas/margin-record.schema';
import { useUpdateMarginRecord } from '../hooks/useUpdateMarginRecord';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import { getValidationErrorMessage } from '../../../lib/errors';
import type { MarginRecord } from '../../../types/margin-record.types';

interface MarginRecordEditModalProps {
  record: MarginRecord;
  onClose: () => void;
}

export const MarginRecordEditModal: React.FC<MarginRecordEditModalProps> = ({ record, onClose }) => {
  const [formData, setFormData] = useState<UpdateMarginRecordFormInput>({
    demand_amount: String(record.demand_amount),
    billed_amount: String(record.billed_amount),
    payment_status: record.payment_status,
    invoice_ref: record.invoice_ref ?? '',
    notes: record.notes ?? '',
  });
  const [validationError, setValidationError] = useState('');
  const updateMarginRecord = useUpdateMarginRecord(onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = updateMarginRecordFormSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }
    updateMarginRecord.mutate({ id: record.id, values: parsed.data });
  };

  const apiError = updateMarginRecord.isError
    ? getValidationErrorMessage(updateMarginRecord.error, 'Failed to update margin record')
    : '';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6 border-b border-outline-variant flex justify-between">
          <h2 className="font-headline-sm">Edit Tracker Entry</h2>
          <button type="button" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ErrorAlert message={validationError || apiError} />

          <p className="text-xs text-on-surface-variant bg-surface-container-low/40 rounded-md p-2">
            The exchange rate ({record.demand_fx_rate}× / {record.billed_fx_rate}×, locked{' '}
            {new Date(record.fx_rate_locked_at).toLocaleDateString()}) can't be changed here — only
            the amounts and status. To fix a currency mistake, delete and recreate this entry.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Demand ({record.demand_currency})
              </label>
              <input
                type="number"
                min="0"
                value={formData.demand_amount ?? ''}
                onChange={(e) => setFormData({ ...formData, demand_amount: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Billed ({record.billed_currency})
              </label>
              <input
                type="number"
                min="0"
                value={formData.billed_amount ?? ''}
                onChange={(e) => setFormData({ ...formData, billed_amount: e.target.value })}
                className="w-full px-3 py-2 border border-outline-variant rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Status</label>
            <select
              value={formData.payment_status}
              onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as UpdateMarginRecordFormInput['payment_status'] })}
              className="w-full px-3 py-2 border border-outline-variant rounded-md bg-white"
            >
              <option value="pending">Pending</option>
              <option value="invoiced">Invoiced</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Ref</label>
            <input type="text" value={formData.invoice_ref ?? ''} onChange={(e) => setFormData({ ...formData, invoice_ref: e.target.value })} className="w-full px-3 py-2 border border-outline-variant rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={formData.notes ?? ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-outline-variant rounded-md h-20 resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-on-surface-variant">Cancel</button>
            <button type="submit" disabled={updateMarginRecord.isPending} className="px-6 py-2 bg-primary text-white rounded-md disabled:opacity-50">{updateMarginRecord.isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
