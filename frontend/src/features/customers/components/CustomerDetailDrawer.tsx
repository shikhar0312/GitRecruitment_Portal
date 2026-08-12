import React, { useEffect, useState } from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { useCustomerDetail } from '../hooks/useCustomerDetail';
import { CustomerContactsCrud } from './CustomerContactsCrud';

type DrawerTab = 'overview' | 'contacts';

interface CustomerDetailDrawerProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function statusBadgeClass(status: string | undefined) {
  if (status === 'active') return 'bg-green-100 text-green-800';
  if (status === 'prospect') return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-800';
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customerId,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const { data: customer, isLoading, isError } = useCustomerDetail(customerId);

  useEffect(() => {
    if (isOpen) setActiveTab('overview');
  }, [customerId, isOpen]);

  if (!isOpen || !customerId) return null;

  const tabClass = (tab: DrawerTab) =>
    `px-4 py-4 font-label-md text-label-md whitespace-nowrap transition-colors ${
      activeTab === tab
        ? 'text-primary border-b-2 border-primary'
        : 'text-on-surface-variant hover:text-primary'
    }`;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
        onClick={onClose}
        role="presentation"
      />
      <aside className="fixed right-0 top-0 h-screen w-full sm:w-[500px] bg-white shadow-2xl z-[70] flex flex-col border-l border-outline-variant">
        <div className="p-6 border-b border-outline-variant flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface-container-low flex items-center justify-center overflow-hidden">
              <span
                className="material-symbols-outlined text-on-surface-variant"
                style={{ fontSize: '32px' }}
              >
                domain
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md">
                {customer?.name ?? 'Loading...'}
              </h3>
              {customer && (
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusBadgeClass(customer.status)}`}
                >
                  {customer.status}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex px-6 border-b border-outline-variant bg-surface-container-low/20">
          <button type="button" className={tabClass('overview')} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button type="button" className={tabClass('contacts')} onClick={() => setActiveTab('contacts')}>
            Contacts {customer?.contacts?.length ? `(${customer.contacts.length})` : ''}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-background/50 custom-scrollbar">
          {isLoading ? (
            <LoadingState />
          ) : isError || !customer ? (
            <p className="text-error text-sm">Failed to load customer details.</p>
          ) : activeTab === 'overview' ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase tracking-wide">Industry</span>
                  <span>{customer.industry ?? '—'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase tracking-wide">Location</span>
                  <span>{[customer.city, customer.country].filter(Boolean).join(', ') || '—'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase tracking-wide">Website</span>
                  <span>{customer.website ?? '—'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase tracking-wide">Account Manager</span>
                  <span>{customer.account_manager?.full_name ?? '—'}</span>
                </div>
              </div>
              {customer.notes && (
                <div>
                  <span className="text-on-surface-variant block text-xs uppercase tracking-wide mb-1">Notes</span>
                  <p className="text-on-surface">{customer.notes}</p>
                </div>
              )}
              {customer.contacts?.some((c) => c.is_primary) && (
                <div className="pt-2 border-t border-outline-variant">
                  <span className="text-on-surface-variant block text-xs uppercase tracking-wide mb-1">
                    Primary Contact
                  </span>
                  {(() => {
                    const primary = customer.contacts?.find((c) => c.is_primary);
                    if (!primary) return null;
                    return (
                      <div>
                        <div className="font-semibold">{primary.name}</div>
                        {primary.email && <div className="text-on-surface-variant text-xs">{primary.email}</div>}
                        {primary.phone && <div className="text-on-surface-variant text-xs">{primary.phone}</div>}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <CustomerContactsCrud customerId={customer.id} customer={customer} />
          )}
        </div>
      </aside>
    </>
  );
};
