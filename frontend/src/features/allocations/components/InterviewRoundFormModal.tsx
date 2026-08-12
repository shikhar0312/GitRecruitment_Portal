import React, { useState, useMemo } from 'react';
import {
  interviewRoundFormSchema,
  toInterviewRoundPayload,
  type InterviewRoundFormValues,
} from '../../../schemas/allocation.schema';
import type { InterviewRound } from '../../../types/allocation.types';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';
import { buildMailtoUrl } from '../../../lib/email';

interface InterviewRoundFormModalProps {
  mode: 'create' | 'edit';
  initialValues: InterviewRoundFormValues;
  isPending: boolean;
  errorMessage?: string;
  /** Candidate details used to pre-compose the notification email */
  candidateName: string;
  candidateEmail: string;
  customerName: string;
  onClose: () => void;
  onSubmit: (values: InterviewRoundFormValues) => void;
}

export function interviewRoundToFormValues(
  round: InterviewRound | null,
  nextRoundNumber: number
): InterviewRoundFormValues {
  if (!round) {
    return {
      round_number: nextRoundNumber,
      round_type: 'screening',
      mode: 'video',
      scheduled_at: '',
      conducted_by: '',
      outcome: undefined,
      feedback: '',
      interview_link: '',
      send_email: false,
    };
  }
  return {
    round_number: round.round_number,
    round_type: round.round_type,
    mode: round.mode ?? undefined,
    scheduled_at: round.scheduled_at ? round.scheduled_at.slice(0, 16) : '',
    conducted_by: round.conducted_by ?? '',
    outcome: round.outcome ?? undefined,
    feedback: round.feedback ?? '',
    interview_link: '',
    send_email: false,
  };
}

export const InterviewRoundFormModal: React.FC<InterviewRoundFormModalProps> = ({
  mode,
  initialValues,
  isPending,
  errorMessage = '',
  candidateName,
  candidateEmail,
  customerName,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<InterviewRoundFormValues>(initialValues);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    const parsed = interviewRoundFormSchema.safeParse(formData);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }
    try {
      toInterviewRoundPayload(parsed.data);
      onSubmit(parsed.data);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Invalid form data');
    }
  };

  // Build the Gmail URL live as the user types — so the <a> href is always up to date
  const gmailUrl = useMemo(() => {
    if (!candidateEmail) return '#';
    return buildMailtoUrl({
      candidateName,
      candidateEmail,
      customerName,
      roundNumber: formData.round_number,
      roundType: formData.round_type,
      scheduledAt: formData.scheduled_at ?? '',
      interviewLink: formData.interview_link ?? '',
    });
  }, [candidateName, candidateEmail, customerName, formData.round_number, formData.round_type, formData.scheduled_at, formData.interview_link]);

  const canSendEmail = !!candidateEmail;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant sticky top-0 bg-white">
          <h2 className="font-headline-sm text-headline-sm">
            {mode === 'create' ? 'Schedule Interview Round' : 'Edit Interview Round'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ErrorAlert message={validationError || errorMessage} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Round Number *</label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={formData.round_number}
                onChange={(e) => setFormData({ ...formData, round_number: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-outline-variant rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Round Type *</label>
              <select
                required
                value={formData.round_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    round_type: e.target.value as InterviewRoundFormValues['round_type'],
                  })
                }
                className="w-full px-3 py-2 border border-outline-variant rounded-md bg-white"
              >
                <option value="screening">Screening</option>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="cultural_fit">Cultural Fit</option>
                <option value="final">Final</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mode</label>
            <select
              value={formData.mode ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mode: (e.target.value || undefined) as InterviewRoundFormValues['mode'],
                })
              }
              className="w-full px-3 py-2 border border-outline-variant rounded-md bg-white"
            >
              <option value="">Select mode</option>
              <option value="video">Video</option>
              <option value="phone">Phone</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Interviewer</label>
            <input
              type="text"
              value={formData.conducted_by ?? ''}
              onChange={(e) => setFormData({ ...formData, conducted_by: e.target.value })}
              className="w-full px-3 py-2 border border-outline-variant rounded-md"
              placeholder="Name of interviewer"
            />
          </div>

          {mode === 'edit' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Outcome</label>
                <select
                  value={formData.outcome ?? ''}
                  disabled={!!initialValues.outcome}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outcome: (e.target.value || undefined) as InterviewRoundFormValues['outcome'],
                    })
                  }
                  className="w-full px-3 py-2 border border-outline-variant rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="no_show">No Show</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
                {!!initialValues.outcome && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    Outcome is locked once recorded. Other fields remain editable.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Feedback</label>
                <textarea
                  value={formData.feedback ?? ''}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md h-24 resize-none"
                />
              </div>
            </>
          )}

          {/* ── Notify Candidate section (create mode only) ── */}
          {mode === 'create' && (
            <div className="border border-outline-variant rounded-lg p-4 space-y-3 bg-surface-container-low">
              <p className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-base">mail</span>
                Notify Candidate
              </p>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Interview Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at ?? ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md bg-white"
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  This date & time will appear in the candidate's email.
                </p>
              </div>

              {/* Interview Link */}
              <div>
                <label className="block text-sm font-medium mb-1">Interview Link</label>
                <input
                  type="url"
                  value={formData.interview_link ?? ''}
                  onChange={(e) => setFormData({ ...formData, interview_link: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md bg-white"
                  placeholder="https://meet.google.com/abc-xyz"
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  Zoom, Google Meet, Teams, or any meeting URL.
                </p>
              </div>

              {/* Live email preview */}
              <div className="bg-white border border-outline-variant rounded-md p-3 text-xs text-on-surface-variant leading-relaxed">
                <p className="font-semibold text-on-surface mb-2 text-xs">Email Preview</p>
                <p><span className="font-medium">To:</span> {candidateEmail || '—'}</p>
                <p><span className="font-medium">Subject:</span> Your Interview Has Been Scheduled — {customerName || '—'}</p>
                <hr className="my-2 border-outline-variant" />
                <p>Hi {candidateName || '[Candidate]'},</p>
                <br />
                <p>Your interview has been scheduled:</p>
                <p>📅 {formData.scheduled_at ? new Date(formData.scheduled_at).toLocaleString() : <span className="italic text-error">Set a date above</span>}</p>
                <p>🔗 {formData.interview_link || <span className="italic">No link added</span>}</p>
                <br />
                <p>Best regards, GIT Software Technologies RMS</p>
              </div>

              {/* Direct Gmail anchor — user clicks this themselves, cannot be blocked */}
              {canSendEmail ? (
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                  Open Mail App to Send Email
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md border-2 border-outline-variant text-on-surface-variant text-sm font-semibold cursor-not-allowed">
                  <span className="material-symbols-outlined text-base">mail</span>
                  Set Scheduled At to enable
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <button type="button" onClick={onClose} className="px-4 py-2 text-on-surface-variant font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-md disabled:opacity-50"
            >
              {isPending ? 'Saving...' : mode === 'create' ? 'Schedule Round' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
