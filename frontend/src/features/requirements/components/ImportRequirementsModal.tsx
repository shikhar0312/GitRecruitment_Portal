import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query-keys';
import { getApiErrorMessage } from '../../../lib/errors';
import {
  downloadRequirementsTemplate,
  previewRequirementsImport,
  commitRequirementsImport,
  type RequirementImportPreview,
} from '../../../api/services/requirements.service';
import { ErrorAlert } from '../../../components/feedback/ErrorAlert';

interface ImportRequirementsModalProps {
  onClose: () => void;
}

export const ImportRequirementsModal: React.FC<ImportRequirementsModalProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<RequirementImportPreview | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ created: number; skipped: number } | null>(null);

  const previewMutation = useMutation({
    mutationFn: (file: File) => previewRequirementsImport(file),
    onSuccess: (data) => {
      setPreview(data);
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not read that file')),
  });

  const commitMutation = useMutation({
    mutationFn: (rows: Record<string, unknown>[]) => commitRequirementsImport(rows),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requirements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      setDone(result);
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Import failed')),
  });

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setPreview(null);
    setDone(null);
    setError('');
    previewMutation.mutate(file);
  };

  const resetFile = () => {
    setFileName('');
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validCount = preview?.valid.length ?? 0;
  const errorCount = preview?.errors.length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Import from Excel</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-surface-variant/20 rounded-full transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <ErrorAlert message={error} />

          {done ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-700 text-3xl">check</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                  {done.created} {done.created === 1 ? 'requirement' : 'requirements'} imported
                </h3>
                {done.skipped > 0 && (
                  <p className="text-sm text-on-surface-variant">
                    {done.skipped} row{done.skipped === 1 ? '' : 's'} skipped.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-surface-container-low/40 border border-outline-variant">
                <span className="material-symbols-outlined text-primary">description</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">Step 1 — Get the template</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Download the sheet, fill one row per requirement, then upload it below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadRequirementsTemplate()}
                  className="text-sm font-semibold text-primary hover:underline whitespace-nowrap"
                >
                  Download template
                </button>
              </div>

              <div>
                <p className="text-sm font-medium text-on-surface mb-2">Step 2 — Upload your file</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-outline-variant rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-3xl">
                    upload_file
                  </span>
                  <p className="text-sm text-on-surface-variant mt-2">
                    {fileName || 'Click to choose an .xlsx or .csv file'}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>
              </div>

              {previewMutation.isPending && (
                <p className="text-sm text-on-surface-variant">Reading your file…</p>
              )}

              {preview && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                      {validCount} ready to import
                    </span>
                    {errorCount > 0 && (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold">
                        {errorCount} need fixing
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={resetFile}
                      className="ml-auto text-xs text-on-surface-variant hover:underline"
                    >
                      Choose a different file
                    </button>
                  </div>

                  {errorCount > 0 && (
                    <div className="border border-outline-variant rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-red-50 text-xs font-semibold text-red-800 uppercase tracking-wide">
                        Rows to fix
                      </div>
                      <div className="max-h-52 overflow-y-auto divide-y divide-outline-variant/50">
                        {preview.errors.map((e) => (
                          <div key={e.row} className="px-4 py-2 text-sm">
                            <span className="font-semibold text-on-surface">Row {e.row}</span>
                            <ul className="list-disc list-inside text-xs text-on-surface-variant mt-1">
                              {e.reasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validCount === 0 && (
                    <p className="text-sm text-on-surface-variant">
                      No valid rows to import yet — fix the rows above and re-upload.
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-variant/10 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={validCount === 0 || commitMutation.isPending}
                  onClick={() => preview && commitMutation.mutate(preview.valid)}
                  className="px-6 py-2 bg-primary text-on-primary font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {commitMutation.isPending
                    ? 'Importing…'
                    : `Import ${validCount} requirement${validCount === 1 ? '' : 's'}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
