import React, { useState } from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useRoles } from '../hooks/useRoles';
import { useDeleteRole } from '../hooks/useRoleMutations';
import { RoleFormModal } from '../components/RoleFormModal';
import type { Role } from '../../../types/role.types';

export const RolesPage: React.FC = () => {
  const { data, isLoading, isError } = useRoles();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const deleteRole = useDeleteRole(() => setDeletingRole(null));

  const roles = data?.data ?? [];

  return (
    <div className="flex-1 overflow-y-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Job Roles</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage role titles used in requirements.</p>
        </div>
        <button type="button" onClick={() => setIsFormOpen(true)} className="bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Add Role
        </button>
      </div>

      <section className="bg-white rounded-xl border border-outline-variant flex-1 min-h-[400px]">
        {isLoading ? <LoadingState /> : isError ? (
          <p className="p-8 text-center text-error">Failed to load roles</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-surface-container-low/30">
                <th className="px-6 py-4 text-xs uppercase text-on-surface-variant">Title</th>
                <th className="px-6 py-4 text-xs uppercase text-on-surface-variant">Category</th>
                <th className="px-6 py-4 text-xs uppercase text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-outline-variant/50">
                  <td className="px-6 py-4 font-semibold">{role.title}</td>
                  <td className="px-6 py-4">{role.category ?? '—'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button type="button" onClick={() => { setEditingRole(role); setIsFormOpen(true); }} className="text-primary text-sm font-semibold hover:underline">Edit</button>
                    <button type="button" onClick={() => setDeletingRole(role)} className="text-error text-sm font-semibold hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {isFormOpen && <RoleFormModal role={editingRole ?? undefined} onClose={() => { setIsFormOpen(false); setEditingRole(null); }} />}
      {deletingRole && (
        <ConfirmDialog title="Delete Role" message={`Delete "${deletingRole.title}"?`} confirmLabel="Delete" isPending={deleteRole.isPending} onCancel={() => setDeletingRole(null)} onConfirm={() => deleteRole.mutate(deletingRole.id)} />
      )}
    </div>
  );
};
