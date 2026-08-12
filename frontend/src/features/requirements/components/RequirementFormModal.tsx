import React, { useState } from 'react';
import {
  createRequirementFormDefaults,
  createRequirementFormSchema,
  BILLING_ENTITY_OPTIONS,
  type CreateRequirementFormValues,
} from '../../../schemas/requirement.schema';
import { useCreateRequirement } from '../hooks/useCreateRequirement';
import { useCustomerOptions } from '../hooks/useCustomerOptions';
import { useRoleOptions } from '../hooks/useRoleOptions';
import { getValidationErrorMessage } from '../../../lib/errors';
import { getBudgetLabel } from '../../../lib/formatters';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';

interface RequirementFormModalProps {
  onClose: () => void;
}

export const RequirementFormModal: React.FC<RequirementFormModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<CreateRequirementFormValues>(createRequirementFormDefaults);
  const [validationError, setValidationError] = useState('');

  const { customers } = useCustomerOptions();
  const { roles } = useRoleOptions();
  const createRequirement = useCreateRequirement(onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const parsed = createRequirementFormSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }

    createRequirement.mutate(parsed.data);
  };

  const errorMessage =
    validationError ||
    (createRequirement.isError
      ? getValidationErrorMessage(createRequirement.error, 'Failed to create job opening')
      : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Add New Requirement</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-surface-variant/20 rounded-full transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ErrorAlert message={errorMessage} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Customer *</label>
              <select
                required
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Role / Job Title *</label>
              <select
                required
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="">Select a role...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Billing Entity *</label>
              <select
                required
                value={formData.billing_entity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billing_entity: e.target.value as CreateRequirementFormValues['billing_entity'],
                  })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                {BILLING_ENTITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-on-surface-variant mt-1">
                Which GIT entity will bill this client and pay the placed candidate.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Hiring Type *</label>
              <select
                value={formData.hiring_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hiring_type: e.target.value as CreateRequirementFormValues['hiring_type'],
                  })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="fixed_term">Fixed Term</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Work Mode *</label>
              <select
                value={formData.work_mode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    work_mode: e.target.value as CreateRequirementFormValues['work_mode'],
                  })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. London, UK or Remote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">No. of Positions *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.no_of_positions}
                onChange={(e) =>
                  setFormData({ ...formData, no_of_positions: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Min Experience (Years) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.min_exp_years}
                onChange={(e) =>
                  setFormData({ ...formData, min_exp_years: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Max Experience (Years) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.max_exp_years}
                onChange={(e) =>
                  setFormData({ ...formData, max_exp_years: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Currency *</label>
              <select
                value={formData.budget_currency}
                onChange={(e) => setFormData({ ...formData, budget_currency: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">
                  Min {getBudgetLabel(formData.hiring_type)}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget_min ?? ''}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">
                  Max {getBudgetLabel(formData.hiring_type)}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.budget_max ?? ''}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as CreateRequirementFormValues['priority'],
                  })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Expected Start Date</label>
              <input
                type="date"
                value={formData.expected_start_date ?? ''}
                onChange={(e) => setFormData({ ...formData, expected_start_date: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            {formData.hiring_type === 'contract' && (
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Min Contract (Months)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.min_contract_months ?? ''}
                  onChange={(e) => setFormData({ ...formData, min_contract_months: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as CreateRequirementFormValues['status'],
                  })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="open">Open</option>
                <option value="on_hold">On Hold</option>
                <option value="filled">Filled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notice_period_buyback"
              checked={formData.notice_period_buyback}
              onChange={(e) => setFormData({ ...formData, notice_period_buyback: e.target.checked })}
              className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary"
            />
            <label htmlFor="notice_period_buyback" className="text-sm font-medium text-on-surface">
              Notice Period Buyback Allowed
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Required Skills * (Comma separated)
            </label>
            <input
              type="text"
              required
              value={formData.required_skills}
              onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
              className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="e.g. React, TypeScript, Node.js"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Nice-to-Have Skills (Comma separated)
            </label>
            <input
              type="text"
              value={formData.nice_to_have_skills ?? ''}
              onChange={(e) => setFormData({ ...formData, nice_to_have_skills: e.target.value })}
              className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="e.g. Docker, AWS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Job Description</label>
            <textarea
              value={formData.job_description ?? ''}
              onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
              className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none h-32 resize-none"
              placeholder="Describe the job opening roles & responsibilities..."
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">
              Visa &amp; Security Clearance
            </h3>

            <label className="flex items-center gap-2 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={formData.visa_sponsorship_available ?? false}
                onChange={(e) =>
                  setFormData({ ...formData, visa_sponsorship_available: e.target.checked })
                }
              />
              Visa sponsorship available for this role
            </label>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Clearance Required
              </label>
              <input
                type="text"
                value={formData.clearance_required ?? ''}
                onChange={(e) => setFormData({ ...formData, clearance_required: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. BPSS, SC, None"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-variant/10 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRequirement.isPending}
              className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createRequirement.isPending ? 'Adding...' : 'Add Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
