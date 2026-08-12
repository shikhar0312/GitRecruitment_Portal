import React, { useState } from 'react';
import { roleFormDefaults, roleFormSchema, type RoleFormValues } from '../../../schemas/role.schema';
import { useCreateRole, useUpdateRole } from '../hooks/useRoleMutations';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import type { Role } from '../../../types/role.types';

interface RoleFormModalProps {
  role?: Role;
  onClose: () => void;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({ role, onClose }) => {
  const isEdit = Boolean(role);
  const [formData, setFormData] = useState<RoleFormValues>(
    role ? { title: role.title, category: role.category ?? '', description: role.description ?? '' } : roleFormDefaults
  );
  const [validationError, setValidationError] = useState('');
  const createRole = useCreateRole(onClose);
  const updateRole = useUpdateRole(onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = roleFormSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }
    if (isEdit && role) updateRole.mutate({ id: role.id, values: parsed.data });
    else createRole.mutate(parsed.data);
  };

  const isPending = createRole.isPending || updateRole.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6 border-b flex justify-between">
          <h2 className="font-headline-sm">{isEdit ? 'Edit Role' : 'Add Role'}</h2>
          <button type="button" onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ErrorAlert message={validationError} />
          <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Title *" className="w-full px-3 py-2 border border-outline-variant rounded-md" />
          <input value={formData.category ?? ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Category" className="w-full px-3 py-2 border border-outline-variant rounded-md" />
          <textarea value={formData.description ?? ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 border border-outline-variant rounded-md h-20 resize-none" />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={isPending} className="px-6 py-2 bg-primary text-white rounded-md disabled:opacity-50">{isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
