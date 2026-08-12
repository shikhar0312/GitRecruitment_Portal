import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCustomer } from '../../../api/services/customers.service';
import { queryKeys } from '../../../lib/query-keys';
import type { CreateCustomerFormValues } from '../../../schemas/customer.schema';

export function useUpdateCustomer(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CreateCustomerFormValues }) =>
      updateCustomer(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      onSuccess?.();
    },
  });
}
