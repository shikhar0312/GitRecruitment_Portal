import React, { useEffect, useMemo, useState } from 'react';
import {
  createMarginRecordFormDefaults,
  createMarginRecordFormSchema,
  type CreateMarginRecordFormInput,
} from '../../../schemas/margin-record.schema';
import { useCreateMarginRecord } from '../hooks/useCreateMarginRecord';
import { usePlacedAllocations } from '../hooks/usePlacedAllocations';
import { getValidationErrorMessage } from '../../../lib/errors';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import {
  BILLING_ENTITY_LABELS,
  REPORTING_CURRENCY_BY_ENTITY,
  type BillingEntity,
} from '../../../types/margin-record.types';

interface MarginRecordFormModalProps {
  onClose: () => void;
}

export const MarginRecordFormModal: React.FC<MarginRecordFormModalProps> = ({ onClose }) => {
  const { allocations, isLoading: optionsLoading } = usePlacedAllocations();
  const [formData, setFormData] = useState<CreateMarginRecordFormInput>(
    createMarginRecordFormDefaults()
  );
  const [validationError, setValidationError] = useState('');

  const selectedAllocation = allocations.find((a) => a.id === formData.allocation_id);
  const billingEntity = selectedAllocation?.requirement?.billing_entity as BillingEntity | undefined;
  const reportingCurrency = billingEntity ? REPORTING_CURRENCY_BY_ENTITY[billingEntity] : null;

  const demandSameCurrency = useMemo(
    () => reportingCurrency != null && formData.demand_currency.toUpperCase() === reportingCurrency,
    [formData.demand_currency, reportingCurrency]
  );
  const billedSameCurrency = useMemo(
    () => reportingCurrency != null && formData.billed_currency.toUpperCase() === reportingCurrency,
    [formData.billed_currency, reportingCurrency]
  );

  // Once an allocation is picked, default both currency fields to the
  // entity's reporting currency — the common case is a same-currency
  // deal, so this keeps the FX rate fields hidden unless genuinely needed.
  useEffect(() => {
    if (reportingCurrency) {
      setFormData((prev) => ({
        ...prev,
        demand_currency: prev.demand_currency || reportingCurrency,
        billed_currency: prev.billed_currency || reportingCurrency,
      }));
    }
  }, [reportingCurrency]);

  const createMarginRecord = useCreateMarginRecord(onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!reportingCurrency) {
      setValidationError('Select a placed allocation first.');
      return;
    }

    const parsed = createMarginRecordFormSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }

    try {
      createMarginRecord.mutate({ values: parsed.data, reportingCurrency });
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Invalid form data');
    }
  };

  const errorMessage =
    validationError ||
    (createMarginRecord.isError
      ? getValidationErrorMessage(createMarginRecord.error, 'Failed to create margin record')
      : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Add to Tracker
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-surface-variant/20 rounded-full transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ErrorAlert message={errorMessage} />

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Placed Allocation *
            </label>
            <select
              required
              value={formData.allocation_id}
              onChange={(e) => setFormData({ ...formData, allocation_id: e.target.value })}
              disabled={optionsLoading}
              className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white disabled:opacity-60"
            >
              <option value="">Select a placed allocation...</option>
              {allocations.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.candidate?.full_name} - {app.requirement?.role?.title} (
                  {app.requirement?.customer?.name})
                </option>
              ))}
            </select>
            {billingEntity && reportingCurrency && (
              <p className="text-xs text-on-surface-variant mt-1">
                Billed via <strong>{BILLING_ENTITY_LABELS[billingEntity]}</strong> — reporting currency{' '}
                <strong>{reportingCurrency}</strong>.
              </p>
            )}
          </div>

          <div className="border border-outline-variant rounded-md p-3 space-y-3">
            <label className="block text-sm font-semibold text-on-surface">
              Candidate Demand (what we pay)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="0"
                required
                value={formData.demand_amount}
                onChange={(e) => setFormData({ ...formData, demand_amount: e.target.value })}
                placeholder="Amount"
                className="col-span-1 px-3 py-2 border border-outline-variant rounded-md"
              />
              <input
                type="text"
                maxLength={3}
                required
                value={formData.demand_currency}
                onChange={(e) =>
                  setFormData({ ...formData, demand_currency: e.target.value.toUpperCase() })
                }
                placeholder="Currency"
                className="col-span-1 px-3 py-2 border border-outline-variant rounded-md uppercase"
              />
              {!demandSameCurrency && reportingCurrency && (
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={formData.demand_fx_rate}
                  onChange={(e) => setFormData({ ...formData, demand_fx_rate: e.target.value })}
                  placeholder={`Rate to ${reportingCurrency}`}
                  className="col-span-1 px-3 py-2 border border-outline-variant rounded-md"
                />
              )}
            </div>
            {!demandSameCurrency && reportingCurrency && (
              <p className="text-xs text-on-surface-variant">
                Exchange rate as of today — this gets locked permanently once saved.
              </p>
            )}
          </div>

          <div className="border border-outline-variant rounded-md p-3 space-y-3">
            <label className="block text-sm font-semibold text-on-surface">
              Client Bill (what we charge, monthly)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="0"
                required
                value={formData.billed_amount}
                onChange={(e) => setFormData({ ...formData, billed_amount: e.target.value })}
                placeholder="Amount"
                className="col-span-1 px-3 py-2 border border-outline-variant rounded-md"
              />
              <input
                type="text"
                maxLength={3}
                required
                value={formData.billed_currency}
                onChange={(e) =>
                  setFormData({ ...formData, billed_currency: e.target.value.toUpperCase() })
                }
                placeholder="Currency"
                className="col-span-1 px-3 py-2 border border-outline-variant rounded-md uppercase"
              />
              {!billedSameCurrency && reportingCurrency && (
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={formData.billed_fx_rate}
                  onChange={(e) => setFormData({ ...formData, billed_fx_rate: e.target.value })}
                  placeholder={`Rate to ${reportingCurrency}`}
                  className="col-span-1 px-3 py-2 border border-outline-variant rounded-md"
                />
              )}
            </div>
            {!billedSameCurrency && reportingCurrency && (
              <p className="text-xs text-on-surface-variant">
                Exchange rate as of today — this gets locked permanently once saved.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Invoice Reference
              </label>
              <input
                type="text"
                value={formData.invoice_ref ?? ''}
                onChange={(e) => setFormData({ ...formData, invoice_ref: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="INV-2026-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Payment Status *
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_status: e.target.value as CreateMarginRecordFormInput['payment_status'],
                  })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="pending">Pending</option>
                <option value="invoiced">Invoiced</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Billing Period Start
              </label>
              <input
                type="date"
                value={formData.billing_period_start ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, billing_period_start: e.target.value })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Billing Period End
              </label>
              <input
                type="date"
                value={formData.billing_period_end ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, billing_period_end: e.target.value })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Notes</label>
            <textarea
              value={formData.notes ?? ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none h-24 resize-none"
              placeholder="Add details about payment terms, billing notes..."
            />
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-variant/10 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMarginRecord.isPending || optionsLoading}
              className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createMarginRecord.isPending ? 'Saving...' : 'Add to Tracker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
