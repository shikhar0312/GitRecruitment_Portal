import React, { useState } from 'react'
import { ErrorAlert } from '../../../components/feedback/ErrorAlert'
import { getApiErrorMessage } from '../../../lib/errors'
import { useConfirmResume } from '../hooks/useConfirmResume'
import { resumeReviewSchema, type ResumeReviewFormValues } from '../../../schemas/resume-parsing.schema'
import type { ResumeUploadResponse } from '../../../types/resume-parsing.types'

interface ResumeReviewStepProps {
  uploadResult: ResumeUploadResponse
  onSuccess: () => void
  onBack: () => void
  onClose: () => void
}

function parsedToFormValues(parsed: ResumeUploadResponse['parsed_data']): ResumeReviewFormValues {
  return {
    full_name: parsed.full_name ?? '',
    email: parsed.email ?? '',
    phone: parsed.phone ?? '',
    current_location: parsed.current_location ?? '',
    exp_years: parsed.exp_years ?? 0,
    current_company: parsed.current_company ?? '',
    current_role: parsed.current_role ?? '',
    highest_qualification: parsed.highest_qualification ?? '',
    availability_status: 'open_to_opportunities',
    currency: 'GBP',
    status: 'active',
    skills: parsed.skills ?? [],
    work_history: (parsed.work_history ?? []).map((w) => ({
      ...w,
      employment_type: w.employment_type ?? 'full_time',
      technologies_used: w.technologies_used ?? [],
      is_current: w.is_current ?? false,
    })),
    education: (parsed.education ?? []).map((e) => ({
      ...e,
      is_current: e.is_current ?? false,
    })),
  }
}

export const ResumeReviewStep: React.FC<ResumeReviewStepProps> = ({
  uploadResult,
  onSuccess,
  onBack,
  onClose,
}) => {
  const [formData, setFormData] = useState<ResumeReviewFormValues>(
    parsedToFormValues(uploadResult.parsed_data)
  )
  const [validationError, setValidationError] = useState('')
  const confirm = useConfirmResume(uploadResult.upload_id, onSuccess)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    const parsed = resumeReviewSchema.safeParse(formData)
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Please fix the form errors')
      return
    }

    confirm.mutate(parsed.data)
  }

  const errorMessage =
    validationError ||
    (confirm.isError ? getApiErrorMessage(confirm.error, 'Failed to save candidate') : '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-outline-variant z-10">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onBack} className="p-1 hover:bg-surface-container-low rounded-full">
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Review Parsed Data</h2>
              <p className="text-xs text-on-surface-variant">
                AI-extracted from resume — edit any field before saving
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ErrorAlert message={errorMessage} />

          {/* ─── Basic Info ─── */}
          <section>
            <h3 className="font-semibold text-on-surface mb-3 text-sm uppercase tracking-wide text-primary">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Location</label>
                <input
                  type="text"
                  value={formData.current_location ?? ''}
                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience *</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  required
                  value={formData.exp_years}
                  onChange={(e) => setFormData({ ...formData, exp_years: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Company</label>
                <input
                  type="text"
                  value={formData.current_company ?? ''}
                  onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Role</label>
                <input
                  type="text"
                  value={formData.current_role ?? ''}
                  onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Highest Qualification</label>
                <input
                  type="text"
                  value={formData.highest_qualification ?? ''}
                  onChange={(e) => setFormData({ ...formData, highest_qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Availability</label>
                <select
                  value={formData.availability_status}
                  onChange={(e) => setFormData({ ...formData, availability_status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md bg-white"
                >
                  <option value="immediate">Immediate</option>
                  <option value="notice_period">Notice Period</option>
                  <option value="not_looking">Not Looking</option>
                  <option value="open_to_opportunities">Open to Opportunities</option>
                </select>
              </div>
            </div>
          </section>

          {/* ─── Skills ─── */}
          <section>
            <h3 className="font-semibold text-on-surface mb-3 text-sm uppercase tracking-wide text-primary">
              Skills ({formData.skills.length})
            </h3>
            <div className="space-y-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-surface-container-low rounded-lg">
                  <input
                    type="text"
                    value={skill.skill}
                    onChange={(e) => {
                      const updated = [...formData.skills]
                      updated[index] = { ...updated[index], skill: e.target.value }
                      setFormData({ ...formData, skills: updated })
                    }}
                    className="flex-1 px-2 py-1 border border-outline-variant rounded text-sm"
                    placeholder="Skill name"
                  />
                  <select
                    value={skill.proficiency ?? ''}
                    onChange={(e) => {
                      const updated = [...formData.skills]
                      updated[index] = { ...updated[index], proficiency: e.target.value as any || undefined }
                      setFormData({ ...formData, skills: updated })
                    }}
                    className="px-2 py-1 border border-outline-variant rounded text-sm bg-white"
                  >
                    <option value="">Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-on-surface-variant whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={skill.is_primary}
                      onChange={(e) => {
                        const updated = [...formData.skills]
                        updated[index] = { ...updated[index], is_primary: e.target.checked }
                        setFormData({ ...formData, skills: updated })
                      }}
                    />
                    Primary
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = formData.skills.filter((_, i) => i !== index)
                      setFormData({ ...formData, skills: updated })
                    }}
                    className="text-error hover:opacity-70"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  skills: [...formData.skills, { skill: '', is_primary: false }]
                })}
                className="text-sm text-primary hover:underline"
              >
                + Add skill
              </button>
            </div>
          </section>

          {/* ─── Work History ─── */}
          <section>
            <h3 className="font-semibold text-on-surface mb-3 text-sm uppercase tracking-wide text-primary">
              Work History ({formData.work_history.length})
            </h3>
            <div className="space-y-3">
              {formData.work_history.map((entry, index) => (
                <div key={index} className="p-4 border border-outline-variant rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase">
                      Position {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.work_history.filter((_, i) => i !== index)
                        setFormData({ ...formData, work_history: updated })
                      }}
                      className="text-error text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={entry.company_name}
                      onChange={(e) => {
                        const updated = [...formData.work_history]
                        updated[index] = { ...updated[index], company_name: e.target.value }
                        setFormData({ ...formData, work_history: updated })
                      }}
                      placeholder="Company name"
                      className="px-2 py-1 border border-outline-variant rounded text-sm"
                    />
                    <input
                      type="text"
                      value={entry.role_title}
                      onChange={(e) => {
                        const updated = [...formData.work_history]
                        updated[index] = { ...updated[index], role_title: e.target.value }
                        setFormData({ ...formData, work_history: updated })
                      }}
                      placeholder="Role title"
                      className="px-2 py-1 border border-outline-variant rounded text-sm"
                    />
                    <input
                      type="text"
                      value={entry.start_date ?? ''}
                      onChange={(e) => {
                        const updated = [...formData.work_history]
                        updated[index] = { ...updated[index], start_date: e.target.value }
                        setFormData({ ...formData, work_history: updated })
                      }}
                      placeholder="Start date (YYYY-MM-DD)"
                      className="px-2 py-1 border border-outline-variant rounded text-sm"
                    />
                    <input
                      type="text"
                      value={entry.end_date ?? ''}
                      onChange={(e) => {
                        const updated = [...formData.work_history]
                        updated[index] = { ...updated[index], end_date: e.target.value }
                        setFormData({ ...formData, work_history: updated })
                      }}
                      placeholder="End date or leave blank if current"
                      className="px-2 py-1 border border-outline-variant rounded text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={entry.is_current}
                      onChange={(e) => {
                        const updated = [...formData.work_history]
                        updated[index] = { ...updated[index], is_current: e.target.checked }
                        setFormData({ ...formData, work_history: updated })
                      }}
                    />
                    Currently working here
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  work_history: [...formData.work_history, {
                    company_name: '', role_title: '', employment_type: 'full_time',
                    is_current: false, technologies_used: []
                  }]
                })}
                className="text-sm text-primary hover:underline"
              >
                + Add position
              </button>
            </div>
          </section>

          {/* ─── Education ─── */}
          <section>
            <h3 className="font-semibold text-on-surface mb-3 text-sm uppercase tracking-wide text-primary">
              Education ({formData.education.length})
            </h3>
            <div className="space-y-3">
              {formData.education.map((entry, index) => (
                <div key={index} className="p-4 border border-outline-variant rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase">
                      Entry {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.education.filter((_, i) => i !== index)
                        setFormData({ ...formData, education: updated })
                      }}
                      className="text-error text-xs hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={entry.institution}
                      onChange={(e) => {
                        const updated = [...formData.education]
                        updated[index] = { ...updated[index], institution: e.target.value }
                        setFormData({ ...formData, education: updated })
                      }}
                      placeholder="Institution"
                      className="px-2 py-1 border border-outline-variant rounded text-sm"
                    />
                    <input
                      type="text"
                      value={entry.degree}
                      onChange={(e) => {
                        const updated = [...formData.education]
                        updated[index] = { ...updated[index], degree: e.target.value }
                        setFormData({ ...formData, education: updated })
                      }}
                      placeholder="Degree"
                      className="px-2 py-1 border border-outline-variant rounded text-sm"
                    />
                    <input
                      type="text"
                      value={entry.field_of_study ?? ''}
                      onChange={(e) => {
                        const updated = [...formData.education]
                        updated[index] = { ...updated[index], field_of_study: e.target.value }
                        setFormData({ ...formData, education: updated })
                      }}
                      placeholder="Field of study"
                      className="px-2 py-1 border border-outline-variant rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={entry.start_year ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.education]
                          updated[index] = { ...updated[index], start_year: Number(e.target.value) || undefined }
                          setFormData({ ...formData, education: updated })
                        }}
                        placeholder="From year"
                        className="w-1/2 px-2 py-1 border border-outline-variant rounded text-sm"
                      />
                      <input
                        type="number"
                        value={entry.end_year ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.education]
                          updated[index] = { ...updated[index], end_year: Number(e.target.value) || undefined }
                          setFormData({ ...formData, education: updated })
                        }}
                        placeholder="To year"
                        className="w-1/2 px-2 py-1 border border-outline-variant rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  education: [...formData.education, {
                    institution: '', degree: '', is_current: false
                  }]
                })}
                className="text-sm text-primary hover:underline"
              >
                + Add education
              </button>
            </div>
          </section>

          {/* ─── Actions ─── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-on-surface-variant font-semibold"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={confirm.isPending}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-md disabled:opacity-50"
            >
              {confirm.isPending ? 'Saving...' : 'Save Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
