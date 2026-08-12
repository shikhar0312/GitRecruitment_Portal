import { useQuery } from '@tanstack/react-query';
import { listCustomers } from '../../../api/services/customers.service';
import { queryKeys } from '../../../lib/query-keys';
import type { PaginationMeta } from '../../../api/types/api.types';
import type { Customer } from '../../../types/customer.types';

const defaultMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

interface UseCustomersResult {
  customers: Customer[];
  meta: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
}

export function useCustomers(search: string, page: number): UseCustomersResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.customers.list(search, page),
    queryFn: () => listCustomers({ search: search || undefined, page }),
  });

  return {
    customers: data?.data ?? [],
    meta: data?.meta ?? defaultMeta,
    isLoading,
    isError,
  };
}
