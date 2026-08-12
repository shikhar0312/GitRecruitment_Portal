import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import type { Candidate } from '../../../types/candidate.types';

interface CandidatesTableProps {
  candidates: Candidate[];
  isLoading: boolean;
  isError: boolean;
  onClearFilters: () => void;
  onRowClick: (candidate: Candidate) => void;
}

function statusBadgeClass(status: Candidate['status']) {
  return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({
  candidates,
  isLoading,
  isError,
  onClearFilters,
  onRowClick,
}) => (
  <section className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col min-h-[400px]">
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low/30">
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Experience
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Availability
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Day Rate
            </th>
            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7}>
                <LoadingState />
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-error">
                Failed to load records
              </td>
            </tr>
          ) : candidates.length === 0 ? (
            <tr>
              <td className="py-32" colSpan={7}>
                <div className="flex flex-col items-center justify-center text-center opacity-60">
                  <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                    <span
                      className="material-symbols-outlined text-display-lg"
                      style={{ fontSize: '48px' }}
                    >
                      person_search
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                    No records found
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                    We couldn&apos;t find any candidates matching your current filters. Try
                    adjusting your search criteria or adding a new candidate.
                  </p>
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-6 border border-outline-variant bg-white px-6 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            candidates.map((candidate) => (
              <tr
                key={candidate.id}
                className="border-b border-outline-variant/50 hover:bg-surface-variant/10 cursor-pointer transition-colors"
                onClick={() => onRowClick(candidate)}
              >
                <td className="px-6 py-4">
                  <div className="font-body-md text-on-surface font-semibold">
                    {candidate.full_name}
                  </div>
                  <div className="text-xs text-on-surface-variant mt-1">
                    {candidate.current_role || 'No role'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-body-md text-on-surface text-sm">{candidate.email}</div>
                  <div className="text-xs text-on-surface-variant mt-1">{candidate.phone}</div>
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface">
                  {candidate.exp_years} Years
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface">
                  {candidate.current_location || 'N/A'}
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface capitalize">
                  {candidate.availability_status.replace(/_/g, ' ')}
                </td>
                <td className="px-6 py-4 font-body-md text-on-surface">
                  {candidate.expected_day_rate
                    ? `${candidate.currency} ${candidate.expected_day_rate}`
                    : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusBadgeClass(candidate.status)}`}
                  >
                    {candidate.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
);
