import { useQuery } from '@tanstack/react-query';
import { getCustomerById } from '../../../api/services/customers.service';
import { queryKeys } from '../../../lib/query-keys';

export function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id ?? ''),
    queryFn: () => getCustomerById(id!),
    enabled: Boolean(id),
  });
}
