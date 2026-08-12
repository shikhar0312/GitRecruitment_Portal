import React from 'react';
import { BILLING_ENTITY_LABELS } from '../../../types/margin-record.types';

interface TrackerToolbarProps {
  billingEntity: string;
  paymentStatus: string;
  onBillingEntityChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
  showingCount: number;
  totalCount: number;
}

export const TrackerToolbar: React.FC<TrackerToolbarProps> = ({
  billingEntity,
  paymentStatus,
  onBillingEntityChange,
  onPaymentStatusChange,
  showingCount,
  totalCount,
}) => (
  <section className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-wrap items-center gap-4 mb-6">
    <select
      value={billingEntity}
      onChange={(e) => onBillingEntityChange(e.target.value)}
      className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary"
    >
      <option value="">All Entities</option>
      {Object.entries(BILLING_ENTITY_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>

    <select
      value={paymentStatus}
      onChange={(e) => onPaymentStatusChange(e.target.value)}
      className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary"
    >
      <option value="">All Payment Statuses</option>
      <option value="pending">Pending</option>
      <option value="invoiced">Invoiced</option>
      <option value="paid">Paid</option>
      <option value="overdue">Overdue</option>
    </select>

    <div className="ml-auto flex items-center gap-2 text-on-surface-variant text-sm">
      Showing {showingCount} of {totalCount}
    </div>
  </section>
);
