import React, { useRef, useState } from 'react'
import { ErrorAlert } from '../../../components/feedback/ErrorAlert'
import { getApiErrorMessage } from '../../../lib/errors'
import { useResumeUpload } from '../hooks/useResumeUpload'
import type { ResumeUploadResponse } from '../../../types/resume-parsing.types'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp'
const MAX_SIZE_MB = 10

interface ResumeUploadStepProps {
  onSuccess: (result: ResumeUploadResponse) => void
  onBack: () => void
  onClose: () => void
}

export const ResumeUploadStep: React.FC<ResumeUploadStepProps> = ({
  onSuccess,
  onBack,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState('')
  const upload = useResumeUpload()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError('')
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValidationError('Invalid file type. Please upload a PDF, JPG, PNG, or WEBP file.')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setValidationError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = () => {
    if (!selectedFile) return
    upload.mutate(selectedFile, {
      onSuccess: (result) => onSuccess(result),
      onError: () => {},
    })
  }

  const errorMessage =
    validationError ||
    (upload.isError ? getApiErrorMessage(upload.error, 'Failed to parse resume') : '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="p-1 hover:bg-surface-container-low rounded-full"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                arrow_back
              </span>
            </button>
            <h2 className="text-xl font-bold text-on-surface">Upload Resume</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <ErrorAlert message={errorMessage} />

        {upload.isPending ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="text-on-surface-variant text-sm">Parsing resume with AI...</p>
            <p className="text-on-surface-variant text-xs">This may take 10–20 seconds</p>
          </div>
        ) : (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-colors mb-4
                ${selectedFile
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant hover:border-primary hover:bg-primary/5'
                }
              `}
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-2 block">
                {selectedFile ? 'task' : 'upload_file'}
              </span>
              {selectedFile ? (
                <>
                  <p className="font-semibold text-on-surface">{selectedFile.name}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Click to change
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-on-surface">Click to select a file</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    PDF, JPG, PNG, WEBP — max {MAX_SIZE_MB}MB
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 text-on-surface-variant font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || upload.isPending}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-md disabled:opacity-50"
              >
                Parse Resume
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
