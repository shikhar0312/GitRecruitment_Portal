import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { hasPermission, hasRole } from '../../../lib/rbac';
import { getAvatarStyle, getInitials } from '../../../lib/avatar';
import type { Customer } from '../../../types/customer.types';

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

function statusPillClass(status: Customer['status']) {
  if (status === 'active') return 'bg-green-100 text-green-800';
  if (status === 'prospect') return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-700';
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
}) => {
  const canEdit = hasPermission('edit_customer');
  const canDelete = hasRole('admin');

  return (
    <section className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col min-h-[400px]">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low/30">
              <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Client</th>
              <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Industry</th>
              <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Location</th>
              <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Primary Contact</th>
              <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Status</th>
              <th className="px-6 py-3.5 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-right">Actions</th>
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
                    <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-5">
                      <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>domain</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">No clients yet</h3>
                    <p className="font-body-md text-on-surface-variant max-w-sm">
                      Add your first client to start tracking requirements and placements.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const contact = primaryContact(customer);
                const location = [customer.city, customer.country].filter(Boolean).join(', ');
                const avatar = getAvatarStyle(customer.name);
                const contactCount = customer.contacts?.length ?? 0;

                return (
                  <tr
                    key={customer.id}
                    className="group border-b border-outline-variant/50 hover:bg-surface-variant/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0"
                          style={{ backgroundColor: avatar.bg, color: avatar.fg }}
                          aria-hidden="true"
                        >
                          {getInitials(customer.name)}
                        </span>
                        <div>
                          <button
                            type="button"
                            onClick={() => onView(customer)}
                            className="font-body-md font-semibold text-on-surface hover:text-primary hover:underline text-left"
                          >
                            {customer.name}
                          </button>
                          {contactCount > 1 && (
                            <div className="text-xs text-on-surface-variant mt-0.5">
                              {contactCount} contacts
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body-md text-on-surface">{customer.industry ?? '—'}</td>
                    <td className="px-6 py-4 font-body-md text-on-surface">{location || '—'}</td>
                    <td className="px-6 py-4">
                      {contact ? (
                        <>
                          <div className="font-body-md text-on-surface">{contact.name}</div>
                          {contact.email && (
                            <div className="text-xs text-on-surface-variant mt-0.5">{contact.email}</div>
                          )}
                        </>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusPillClass(customer.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onView(customer)}
                          title="View"
                          className="w-8 h-8 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(customer)}
                            title="Edit"
                            className="w-8 h-8 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(customer)}
                            title="Delete"
                            className="w-8 h-8 rounded-lg border border-outline-variant text-on-surface-variant hover:text-error hover:border-error transition-colors flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
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
};
