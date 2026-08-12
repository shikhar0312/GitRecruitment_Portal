import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMarginRecord } from '../../../api/services/margin-records.service';
import { queryKeys } from '../../../lib/query-keys';
import type { UpdateMarginRecordFormInput } from '../../../schemas/margin-record.schema';

export function useUpdateMarginRecord(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateMarginRecordFormInput }) =>
      updateMarginRecord(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tracker.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      onSuccess?.();
    },
  });
}
