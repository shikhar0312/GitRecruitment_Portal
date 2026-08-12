import { useQuery } from '@tanstack/react-query';
import { listCustomers } from '../../../api/services/customers.service';
import { queryKeys } from '../../../lib/query-keys';

export function useCustomerOptions() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.customers.activeList(),
    queryFn: () => listCustomers({ limit: 100 }),
  });

  return {
    customers: data?.data ?? [],
    isLoading,
  };
}
