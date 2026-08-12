import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasPermission } from '../../../lib/rbac';
import { getApiErrorMessage } from '../../../lib/errors';
import { queryKeys } from '../../../lib/query-keys';
import {
  createCustomerContact,
  updateCustomerContact,
  deleteCustomerContact,
} from '../../../api/services/customers.service';
import {
  customerContactFormDefaults,
  customerContactFormSchema,
  CONTACT_LABEL_OPTIONS,
  type CustomerContactFormValues,
} from '../../../schemas/customer.schema';
import type { Customer, CustomerContact } from '../../../types/customer.types';

interface CustomerContactsCrudProps {
  customerId: string;
  customer: Customer;
}

function labelText(label: string) {
  return CONTACT_LABEL_OPTIONS.find((o) => o.value === label)?.label ?? label;
}

export const CustomerContactsCrud: React.FC<CustomerContactsCrudProps> = ({
  customerId,
  customer,
}) => {
  const queryClient = useQueryClient();
  const canEdit = hasPermission('edit_customer');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CustomerContactFormValues>(
    customerContactFormDefaults
  );
  const [actionError, setActionError] = useState('');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(customerId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormValues(customerContactFormDefaults);
    setActionError('');
  };

  const createMutation = useMutation({
    mutationFn: () => createCustomerContact(customerId, formValues),
    onSuccess: () => {
      invalidate();
      resetForm();
    },
    onError: (error) => setActionError(getApiErrorMessage(error, 'Failed to add contact')),
  });

  const updateMutation = useMutation({
    mutationFn: (contactId: string) => updateCustomerContact(customerId, contactId, formValues),
    onSuccess: () => {
      invalidate();
      resetForm();
    },
    onError: (error) => setActionError(getApiErrorMessage(error, 'Failed to update contact')),
  });

  const deleteMutation = useMutation({
    mutationFn: (contactId: string) => deleteCustomerContact(customerId, contactId),
    onSuccess: () => invalidate(),
    onError: (error) => setActionError(getApiErrorMessage(error, 'Failed to remove contact')),
  });

  const startEdit = (contact: CustomerContact) => {
    setEditingId(contact.id);
    setIsAdding(false);
    setFormValues({
      name: contact.name,
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      label: contact.label,
      is_primary: contact.is_primary,
      notes: contact.notes ?? '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customerContactFormSchema.safeParse(formValues);
    if (!parsed.success) {
      setActionError(parsed.error.issues[0]?.message ?? 'Invalid contact details');
      return;
    }
    if (editingId) {
      updateMutation.mutate(editingId);
    } else {
      createMutation.mutate();
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const contacts = customer.contacts ?? [];

  return (
    <div className="space-y-4">
      {actionError && <p className="text-sm text-error">{actionError}</p>}

      {contacts.length === 0 && !isAdding ? (
        <p className="text-sm text-on-surface-variant">No contacts added yet.</p>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="border border-outline-variant rounded-lg p-3 flex items-start justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-on-surface">{contact.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-surface-container-low text-on-surface-variant">
                    {labelText(contact.label)}
                  </span>
                  {contact.is_primary && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-primary-container text-on-primary-container">
                      Primary
                    </span>
                  )}
                </div>
                {contact.email && (
                  <div className="text-xs text-on-surface-variant mt-1">{contact.email}</div>
                )}
                {contact.phone && (
                  <div className="text-xs text-on-surface-variant">{contact.phone}</div>
                )}
                {contact.notes && (
                  <div className="text-xs text-on-surface-variant mt-1 italic">{contact.notes}</div>
                )}
              </div>
              {canEdit && (
                <div className="flex gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(contact)}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(contact.id)}
                    className="text-xs text-error hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!canEdit ? null : isAdding || editingId ? (
        <form
          onSubmit={handleSubmit}
          className="border border-outline-variant rounded-lg p-4 space-y-3 bg-surface-container-low/20"
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              placeholder="Name *"
              className="px-3 py-2 border border-outline-variant rounded-md text-sm col-span-2"
            />
            <select
              value={formValues.label}
              onChange={(e) =>
                setFormValues({
                  ...formValues,
                  label: e.target.value as CustomerContactFormValues['label'],
                })
              }
              className="px-3 py-2 border border-outline-variant rounded-md text-sm bg-white"
            >
              {CONTACT_LABEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              <input
                type="checkbox"
                checked={formValues.is_primary}
                onChange={(e) => setFormValues({ ...formValues, is_primary: e.target.checked })}
              />
              Primary contact
            </label>
            <input
              type="email"
              value={formValues.email ?? ''}
              onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
              placeholder="Email"
              className="px-3 py-2 border border-outline-variant rounded-md text-sm"
            />
            <input
              value={formValues.phone ?? ''}
              onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
              placeholder="Phone"
              className="px-3 py-2 border border-outline-variant rounded-md text-sm"
            />
            <textarea
              value={formValues.notes ?? ''}
              onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
              placeholder="Notes (optional)"
              className="px-3 py-2 border border-outline-variant rounded-md text-sm col-span-2 h-16 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-variant/10 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !formValues.name.trim()}
              className="px-3 py-2 bg-primary text-white text-sm rounded-md disabled:opacity-50"
            >
              {isPending ? 'Saving...' : editingId ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setFormValues(customerContactFormDefaults);
          }}
          className="px-3 py-2 border border-dashed border-outline-variant text-sm text-on-surface-variant rounded-md hover:border-primary hover:text-primary transition-colors w-full"
        >
          + Add Contact
        </button>
      )}
    </div>
  );
};
