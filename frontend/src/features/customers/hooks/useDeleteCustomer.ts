import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCustomer } from '../../../api/services/customers.service';
import { queryKeys } from '../../../lib/query-keys';
import type { Customer } from '../../../types/customer.types';

export function useDeleteCustomer(onSuccess?: (data: { success: boolean; message: string; data: Customer }) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      onSuccess?.(data);
    },
  });
}
