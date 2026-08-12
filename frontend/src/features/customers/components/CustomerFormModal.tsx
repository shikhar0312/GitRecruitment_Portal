import React, { useEffect, useState } from 'react';
import {
  createCustomerFormDefaults,
  createCustomerFormSchema,
  type CreateCustomerFormValues,
} from '../../../schemas/customer.schema';
import { useCreateCustomer } from '../hooks/useCreateCustomer';
import { useUpdateCustomer } from '../hooks/useUpdateCustomer';
import { getValidationErrorMessage } from '../../../lib/errors';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import type { Customer } from '../../../types/customer.types';

interface CustomerFormModalProps {
  onClose: () => void;
  customer?: Customer;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ onClose, customer }) => {
  const isEdit = Boolean(customer);
  const [formData, setFormData] = useState<CreateCustomerFormValues>(
    customer
      ? {
          name: customer.name,
          industry: customer.industry ?? '',
          country: customer.country ?? '',
          city: customer.city ?? '',
          status: customer.status,
        }
      : createCustomerFormDefaults
  );
  const [validationError, setValidationError] = useState('');

  const createCustomer = useCreateCustomer(onClose);
  const updateCustomer = useUpdateCustomer(onClose);
  const isPending = createCustomer.isPending || updateCustomer.isPending;

  useEffect(() => {
    setValidationError('');
    createCustomer.reset();
    updateCustomer.reset();
  }, [customer?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const parsed = createCustomerFormSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }

    if (isEdit && customer) {
      updateCustomer.mutate({ id: customer.id, values: parsed.data });
    } else {
      createCustomer.mutate(parsed.data);
    }
  };

  const mutationError = isEdit ? updateCustomer.error : createCustomer.error;
  const mutationFailed = isEdit ? updateCustomer.isError : createCustomer.isError;
  const errorMessage =
    validationError ||
    (mutationFailed
      ? getValidationErrorMessage(mutationError, `Failed to ${isEdit ? 'update' : 'create'} customer`)
      : '');

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-surface-variant/20 rounded-full transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ErrorAlert message={errorMessage} />

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">
              Customer Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry ?? ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. Finance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country ?? ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">City</label>
                <input
                  type="text"
                  value={formData.city ?? ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as CreateCustomerFormValues['status'],
                    })
                  }
                  className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="prospect">Prospect</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant bg-surface-container-low/40 rounded-md p-3">
            {isEdit
              ? "Manage this customer's contacts (Primary, HR, Procurement, etc.) from the Contacts tab after opening their detail view."
              : "You'll be able to add contacts (Primary, HR, Procurement, etc.) once this customer is created — open their detail view from the list."}
          </p>

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
              disabled={isPending}
              className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
