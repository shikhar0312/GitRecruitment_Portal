import { useQuery } from '@tanstack/react-query';
import { listMarginRecords } from '../../../api/services/margin-records.service';
import { queryKeys } from '../../../lib/query-keys';
import type { PaginationMeta } from '../../../api/types/api.types';
import type { MarginRecord, BillingEntity, PaymentStatus } from '../../../types/margin-record.types';

const defaultMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

interface UseMarginRecordsFilters {
  billingEntity: string;
  paymentStatus: string;
}

interface UseMarginRecordsResult {
  records: MarginRecord[];
  meta: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
}

export function useMarginRecords(page: number, filters: UseMarginRecordsFilters): UseMarginRecordsResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.tracker.list(page, {
      billingEntity: filters.billingEntity,
      paymentStatus: filters.paymentStatus,
    }),
    queryFn: () =>
      listMarginRecords({
        page,
        billing_entity: (filters.billingEntity || undefined) as BillingEntity | undefined,
        payment_status: (filters.paymentStatus || undefined) as PaymentStatus | undefined,
      }),
  });

  return {
    records: data?.data ?? [],
    meta: data?.meta ?? defaultMeta,
    isLoading,
    isError,
  };
}
