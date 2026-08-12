import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hasPermission } from '../../../lib/rbac';
import { Pagination } from '../../../components/ui/Pagination';
import { useMarginRecords } from '../hooks/useMarginRecords';
import { TrackerToolbar } from '../components/TrackerToolbar';
import { TrackerTable } from '../components/TrackerTable';
import { MarginRecordFormModal } from '../components/MarginRecordFormModal';
import { MarginRecordEditModal } from '../components/MarginRecordEditModal';
import type { MarginRecord } from '../../../types/margin-record.types';

export const TrackerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingEntity, setBillingEntity] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MarginRecord | null>(null);

  useEffect(() => {
    setPage(1);
  }, [billingEntity, paymentStatus]);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { records, meta, isLoading, isError } = useMarginRecords(page, {
    billingEntity,
    paymentStatus,
  });

  return (
    <div className="flex-1 overflow-y-auto flex flex-col h-full relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Tracker</h2>
          <p className="font-body-md text-on-surface-variant mt-1">
            Every placed candidate, their client, and the margin we're making — across all three
            GIT entities.
          </p>
        </div>
        {hasPermission('create_tracker') && (
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label-md text-label-md font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">add_chart</span>
            Add to Tracker
          </button>
        )}
      </div>

      <TrackerToolbar
        billingEntity={billingEntity}
        paymentStatus={paymentStatus}
        onBillingEntityChange={setBillingEntity}
        onPaymentStatusChange={setPaymentStatus}
        showingCount={records.length}
        totalCount={meta.total}
      />

      <TrackerTable
        records={records}
        isLoading={isLoading}
        isError={isError}
        onEdit={setEditingRecord}
      />

      <Pagination page={page} meta={meta} onPageChange={setPage} />

      {isFormOpen && <MarginRecordFormModal onClose={() => setIsFormOpen(false)} />}
      {editingRecord && (
        <MarginRecordEditModal record={editingRecord} onClose={() => setEditingRecord(null)} />
      )}
    </div>
  );
};
