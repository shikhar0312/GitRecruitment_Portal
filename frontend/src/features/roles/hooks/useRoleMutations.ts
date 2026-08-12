import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRole, updateRole, deleteRole } from '../../../api/services/roles.service';
import { queryKeys } from '../../../lib/query-keys';
import type { RoleFormValues } from '../../../schemas/role.schema';

export function useCreateRole(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: RoleFormValues) => createRole(values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.roles.all }); onSuccess?.(); },
  });
}

export function useUpdateRole(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: RoleFormValues }) => updateRole(id, values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.roles.all }); onSuccess?.(); },
  });
}

export function useDeleteRole(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.roles.all }); onSuccess?.(); },
  });
}
