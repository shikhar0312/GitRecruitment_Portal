import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hasPermission } from '../../../lib/rbac';
import { useDebouncedValue } from '../../../lib/hooks/useDebouncedValue';
import { Pagination } from '../../../components/ui/Pagination';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { getApiErrorMessage } from '../../../lib/errors';
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import { CustomersToolbar } from '../components/CustomersToolbar';
import { CustomersTable } from '../components/CustomersTable';
import { CustomerFormModal } from '../components/CustomerFormModal';
import { CustomerDetailDrawer } from '../components/CustomerDetailDrawer';
import type { Customer } from '../../../types/customer.types';

export const CustomersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search);
  const deleteCustomer = useDeleteCustomer((data) => {
    setDeletingCustomer(null);
    setSuccessMessage(data.message);
    setTimeout(() => setSuccessMessage(null), 5000);
  });

  useEffect(() => setPage(1), [debouncedSearch]);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { customers, meta, isLoading, isError } = useCustomers(debouncedSearch, page);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col h-full relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Customers</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage your enterprise partners and subsidiaries.</p>
        </div>
        {hasPermission('create_customer') && (
          <button type="button" onClick={() => setIsFormOpen(true)} className="bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label-md text-label-md font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-sm">
            <span className="material-symbols-outlined">domain_add</span>
            Add Customer
          </button>
        )}
      </div>

      <CustomersToolbar search={search} onSearchChange={setSearch} showingCount={customers.length} totalCount={meta.total} />
      <CustomersTable
        customers={customers}
        isLoading={isLoading}
        isError={isError}
        onView={(c) => { setViewingCustomerId(c.id); setIsDetailOpen(true); }}
        onEdit={(c) => { setEditingCustomer(c); setIsFormOpen(true); }}
        onDelete={setDeletingCustomer}
      />
      <Pagination page={page} meta={meta} onPageChange={setPage} />

      {isFormOpen && <CustomerFormModal onClose={closeForm} customer={editingCustomer ?? undefined} />}

      <CustomerDetailDrawer
        customerId={viewingCustomerId}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}

      {deletingCustomer && (
        <ConfirmDialog
          title="Delete Customer"
          message={
            deleteCustomer.isError
              ? getApiErrorMessage(deleteCustomer.error, 'An error occurred while deleting the customer.')
              : `Are you sure you want to delete "${deletingCustomer.name}"? This cannot be undone.`
          }
          confirmLabel="Delete"
          isPending={deleteCustomer.isPending}
          onCancel={() => { setDeletingCustomer(null); deleteCustomer.reset(); }}
          onConfirm={() => deleteCustomer.mutate(deletingCustomer.id)}
        />
      )}
    </div>
  );
};
