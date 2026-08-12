import React, { useEffect, useState } from 'react';
import {
  createCandidateFormDefaults,
  createCandidateFormSchema,
  type CreateCandidateFormValues,
} from '../../../schemas/candidate.schema';
import { useCreateCandidate } from '../hooks/useCreateCandidate';
import { useUpdateCandidate } from '../hooks/useUpdateCandidate';
import { getValidationErrorMessage } from '../../../lib/errors';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';

interface CandidateFormModalProps {
  onClose: () => void;
  candidate?: import('../../../types/candidate.types').Candidate;
}

export const CandidateFormModal: React.FC<CandidateFormModalProps> = ({ onClose, candidate }) => {
  const isEdit = Boolean(candidate);
  const [formData, setFormData] = useState<CreateCandidateFormValues>(
    candidate
      ? {
          full_name: candidate.full_name,
          email: candidate.email,
          phone: candidate.phone,
          exp_years: candidate.exp_years,
          currency: candidate.currency,
          expected_day_rate: candidate.expected_day_rate?.toString() ?? '',
          availability_status: candidate.availability_status,
          preferred_location: candidate.preferred_location ?? '',
          source: candidate.source ?? 'linkedin',
          skills: '',
          requires_visa_sponsorship: candidate.requires_visa_sponsorship ?? false,
          visa_status: candidate.visa_status ?? '',
          security_clearance_level: candidate.security_clearance_level ?? '',
          security_clearance_expiry: candidate.security_clearance_expiry
            ? candidate.security_clearance_expiry.slice(0, 10)
            : '',
        }
      : createCandidateFormDefaults
  );
  const [validationError, setValidationError] = useState('');

  const createCandidate = useCreateCandidate(onClose);
  const updateCandidate = useUpdateCandidate(onClose);
  const isPending = createCandidate.isPending || updateCandidate.isPending;

  useEffect(() => {
    setValidationError('');
    createCandidate.reset();
    updateCandidate.reset();
  }, [candidate?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const parsed = createCandidateFormSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }

    if (isEdit && candidate) updateCandidate.mutate({ id: candidate.id, values: parsed.data });
    else createCandidate.mutate(parsed.data);
  };

  const mutationError = isEdit ? updateCandidate.error : createCandidate.error;
  const mutationFailed = isEdit ? updateCandidate.isError : createCandidate.isError;
  const errorMessage =
    validationError ||
    (mutationFailed
      ? getValidationErrorMessage(mutationError, `Failed to ${isEdit ? 'update' : 'create'} candidate`)
      : '');

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            {isEdit ? 'Edit Candidate' : 'Add New Candidate'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-surface-variant/20 rounded-full transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ErrorAlert message={errorMessage} />

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="john@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="+44 7700 900001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Experience (Years) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.exp_years}
                onChange={(e) =>
                  setFormData({ ...formData, exp_years: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Availability Status *
              </label>
              <select
                value={formData.availability_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availability_status: e.target
                      .value as CreateCandidateFormValues['availability_status'],
                  })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="immediate">Immediate</option>
                <option value="notice_period">On Notice Period</option>
                <option value="open_to_opportunities">Open to Opportunities</option>
                <option value="not_looking">Not Looking</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-on-surface mb-1">Currency *</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-on-surface mb-1">
                Expected Day Rate
              </label>
              <input
                type="number"
                min="0"
                value={formData.expected_day_rate ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, expected_day_rate: e.target.value })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. 500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Preferred Location
              </label>
              <input
                type="text"
                value={formData.preferred_location ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, preferred_location: e.target.value })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. London, UK"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Source *</label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source: e.target.value as CreateCandidateFormValues['source'],
                  })
                }
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="referral">Referral</option>
                <option value="job_board">Job Board</option>
                <option value="direct">Direct</option>
                <option value="agency">Agency</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-outline-variant pb-2">
              Visa &amp; Security Clearance
            </h3>

            <label className="flex items-center gap-2 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={formData.requires_visa_sponsorship ?? false}
                onChange={(e) =>
                  setFormData({ ...formData, requires_visa_sponsorship: e.target.checked })
                }
              />
              Requires visa sponsorship
            </label>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Visa Status</label>
              <input
                type="text"
                value={formData.visa_status ?? ''}
                onChange={(e) => setFormData({ ...formData, visa_status: e.target.value })}
                className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="e.g. Skilled Worker visa, valid until 2028"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Security Clearance Level
                </label>
                <input
                  type="text"
                  value={formData.security_clearance_level ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, security_clearance_level: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. SC, DV, None"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Clearance Expiry
                </label>
                <input
                  type="date"
                  value={formData.security_clearance_expiry ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, security_clearance_expiry: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
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
              disabled={isPending}
              className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
