import React, { useRef, useState } from 'react'
import { CandidateFormModal } from './CandidateFormModal'
import { CandidateSplitEntryModal } from './CandidateSplitEntryModal'

type Step = 'choose' | 'split' | 'manual'

interface AddCandidateModalProps {
  onClose: () => void
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp'
const MAX_SIZE_MB = 10

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ onClose }) => {
  const [step, setStep] = useState<Step>('choose')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Invalid file type. Upload a PDF, JPG, PNG, or WEBP.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return
    }
    setResumeFile(file)
    setStep('split')
  }

  if (step === 'manual') {
    return <CandidateFormModal onClose={onClose} />
  }

  if (step === 'split' && resumeFile) {
    return (
      <CandidateSplitEntryModal
        resumeFile={resumeFile}
        onClose={onClose}
        onBack={() => {
          setResumeFile(null)
          setStep('choose')
        }}
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

        {fileError && <p className="text-sm text-error mb-4">{fileError}</p>}

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 p-6 border-2 border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition-colors text-center"
          >
            <span className="material-symbols-outlined text-4xl text-primary">upload_file</span>
            <div>
              <div className="font-semibold text-on-surface">Upload Resume</div>
              <div className="text-xs text-on-surface-variant mt-1">
                Fill the form side-by-side with the resume
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStep('manual')}
            className="flex flex-col items-center gap-3 p-6 border-2 border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition-colors text-center"
          >
            <span className="material-symbols-outlined text-4xl text-primary">edit_note</span>
            <div>
              <div className="font-semibold text-on-surface">Fill Manually</div>
              <div className="text-xs text-on-surface-variant mt-1">
                Enter candidate details by hand
              </div>
            </div>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFilePicked}
          className="hidden"
        />
      </div>
    </div>
  )
}
