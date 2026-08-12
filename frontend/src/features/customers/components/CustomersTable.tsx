import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { hasPermission, hasRole } from '../../../lib/rbac';
import type { Customer } from '../../../types/customer.types';

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

function statusBadgeClass(status: Customer['status']) {
  if (status === 'active') return 'bg-green-100 text-green-800';
  if (status === 'prospect') return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-800';
}

function primaryContact(customer: Customer) {
  return customer.contacts?.find((c) => c.is_primary) ?? customer.contacts?.[0];
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  isLoading,
  isError,
  onView,
  onEdit,
  onDelete,
}) => (
  <section className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col min-h-[400px]">
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low/30">
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer Name</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Industry</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Location</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Primary Contact</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={6}><LoadingState /></td></tr>
          ) : isError ? (
            <tr><td colSpan={6} className="p-8 text-center text-error">Failed to load customers</td></tr>
          ) : customers.length === 0 ? (
            <tr>
              <td className="py-32" colSpan={6}>
                <div className="flex flex-col items-center justify-center text-center opacity-60">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">No customers found</h3>
                </div>
              </td>
            </tr>
          ) : (
            customers.map((customer) => {
              const contact = primaryContact(customer);
              return (
                <tr key={customer.id} className="border-b border-outline-variant/50 hover:bg-surface-variant/5">
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onView(customer)}
                      className="font-body-md font-semibold text-on-surface hover:text-primary hover:underline text-left"
                    >
                      {customer.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface">{customer.industry ?? '—'}</td>
                  <td className="px-6 py-4 font-body-md text-on-surface">{[customer.city, customer.country].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="font-body-md text-on-surface">{contact?.name ?? '—'}</div>
                    {contact?.email && <div className="text-xs text-on-surface-variant">{contact.email}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusBadgeClass(customer.status)}`}>{customer.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button type="button" onClick={() => onView(customer)} className="text-on-surface-variant text-sm font-semibold hover:underline">View</button>
                    {hasPermission('edit_customer') && (
                      <button type="button" onClick={() => onEdit(customer)} className="text-primary text-sm font-semibold hover:underline">Edit</button>
                    )}
                    {hasRole('admin') && (
                      <button type="button" onClick={() => onDelete(customer)} className="text-error text-sm font-semibold hover:underline">Delete</button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </section>
);
