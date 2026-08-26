import React, { useEffect, useMemo, useState } from 'react';
import {
  createCandidateFormDefaults,
  createCandidateFormSchema,
  type CreateCandidateFormValues,
} from '../../../schemas/candidate.schema';
import { useCreateCandidateWithResume } from '../hooks/useCreateCandidateWithResume';
import { getValidationErrorMessage } from '../../../lib/errors';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';

interface CandidateSplitEntryModalProps {
  resumeFile: File;
  onClose: () => void;
  onBack: () => void;
}

// Add a candidate by reading their uploaded resume alongside the form. The
// resume is previewed straight from the browser (object URL) — nothing is
// parsed; HR fills every field herself. On submit the file is attached to the
// created candidate. No AI involved.
export const CandidateSplitEntryModal: React.FC<CandidateSplitEntryModalProps> = ({
  resumeFile,
  onClose,
  onBack,
}) => {
  const [formData, setFormData] = useState<CreateCandidateFormValues>(createCandidateFormDefaults);
  const [validationError, setValidationError] = useState('');
  const createCandidate = useCreateCandidateWithResume(onClose);

  const isPdf = resumeFile.type === 'application/pdf';
  const previewUrl = useMemo(() => URL.createObjectURL(resumeFile), [resumeFile]);
  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    const parsed = createCandidateFormSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }
    createCandidate.mutate({ values: parsed.data, resumeFile });
  };

  const errorMessage =
    validationError ||
    (createCandidate.isError
      ? getValidationErrorMessage(createCandidate.error, 'Failed to create candidate')
      : '');

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="p-1 hover:bg-surface-container-low rounded-full"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Add Candidate</h2>
              <p className="text-xs text-on-surface-variant">
                Read the resume on the right and fill the form on the left.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-surface-variant/20 rounded-full transition-colors text-on-surface-variant"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0">
          {/* ── Left: the form ── */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col min-h-0 border-r border-outline-variant"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-on-surface mb-1">Email *</label>
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
                  <label className="block text-sm font-medium text-on-surface mb-1">Phone *</label>
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
                    onChange={(e) => setFormData({ ...formData, exp_years: Number(e.target.value) })}
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
                    onChange={(e) => setFormData({ ...formData, expected_day_rate: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skills ?? ''}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-2 border border-outline-variant rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="e.g. React, TypeScript, Node.js"
                />
              </div>

              <div className="space-y-4 pt-2">
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
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-outline-variant shrink-0 bg-surface-container-lowest">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-variant/10 rounded-md transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={createCandidate.isPending}
                className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {createCandidate.isPending ? 'Saving...' : 'Save Candidate'}
              </button>
            </div>
          </form>

          {/* ── Right: the resume preview ── */}
          <div className="hidden lg:flex flex-col min-h-0 bg-surface-container-low/40">
            <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant shrink-0">
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide truncate">
                {resumeFile.name}
              </span>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-semibold hover:underline shrink-0 ml-2"
              >
                Open in new tab
              </a>
            </div>
            <div className="flex-1 min-h-0">
              {isPdf ? (
                <iframe
                  src={previewUrl}
                  title="Uploaded resume"
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full overflow-auto p-4 flex items-start justify-center">
                  <img src={previewUrl} alt="Uploaded resume" className="max-w-full h-auto" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
