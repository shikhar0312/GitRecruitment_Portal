import React, { useState } from 'react'
import { ResumeUploadStep } from './ResumeUploadStep'
import { ResumeReviewStep } from './ResumeReviewStep'
import type { ResumeUploadResponse } from '../../../types/resume-parsing.types'

// Import your existing manual form component here
import { CandidateFormModal } from './CandidateFormModal'

type Step = 'choose' | 'upload' | 'review' | 'manual'

interface AddCandidateModalProps {
  onClose: () => void
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<Step>('choose')
  const [uploadResult, setUploadResult] = useState<ResumeUploadResponse | null>(null)

  if (step === 'manual') {
    // render your existing CandidateFormModal with onClose
    return <CandidateFormModal onClose={onClose} />
  }

  if (step === 'upload') {
    return (
      <ResumeUploadStep
        onSuccess={(result) => {
          setUploadResult(result)
          setStep('review')
        }}
        onBack={() => setStep('choose')}
        onClose={onClose}
      />
    )
  }

  if (step === 'review' && uploadResult) {
    return (
      <ResumeReviewStep
        uploadResult={uploadResult}
        onSuccess={onClose}
        onBack={() => setStep('upload')}
        onClose={onClose}
      />
    )
  }

  // 'choose' step
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface">Add Candidate</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-surface-container-low rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-sm text-on-surface-variant mb-6">
          How would you like to add this candidate?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setStep('upload')}
            className="flex flex-col items-center gap-3 p-6 border-2 border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition-colors text-center"
          >
            <span className="material-symbols-outlined text-4xl text-primary">
              upload_file
            </span>
            <div>
              <div className="font-semibold text-on-surface">Upload Resume</div>
              <div className="text-xs text-on-surface-variant mt-1">
                Parse with AI — auto-fills the form
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStep('manual')}
            className="flex flex-col items-center gap-3 p-6 border-2 border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition-colors text-center"
          >
            <span className="material-symbols-outlined text-4xl text-primary">
              edit_note
            </span>
            <div>
              <div className="font-semibold text-on-surface">Fill Manually</div>
              <div className="text-xs text-on-surface-variant mt-1">
                Enter candidate details by hand
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
