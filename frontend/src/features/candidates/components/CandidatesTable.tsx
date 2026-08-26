import React from 'react';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { getAvatarStyle, getInitials } from '../../../lib/avatar';
import type { Candidate } from '../../../types/candidate.types';

interface CandidatesTableProps {
  candidates: Candidate[];
  isLoading: boolean;
  isError: boolean;
  onClearFilters: () => void;
  onRowClick: (candidate: Candidate) => void;
}

function statusPillClass(status: Candidate['status']) {
  if (status === 'active') return 'bg-green-100 text-green-800';
  if (status === 'placed') return 'bg-blue-100 text-blue-800';
  if (status === 'blacklisted') return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-700';
}

// Availability reads as a traffic light: ready now / soon / not available.
function availabilityPillClass(status: string) {
  if (status === 'immediate') return 'bg-green-100 text-green-800';
  if (status === 'notice_period' || status === 'open_to_opportunities')
    return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-700';
}

function primarySkills(candidate: Candidate): string[] {
  const skills = candidate.skills ?? [];
  return skills
    .filter((s) => s.is_primary)
    .map((s) => s.skill)
    .slice(0, 3);
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
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low/30">
            <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Candidate</th>
            <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Experience</th>
            <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Location</th>
            <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Availability</th>
            <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px] text-right">Day Rate</th>
            <th className="px-6 py-3.5 font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">Status</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={6}><LoadingState /></td></tr>
          ) : isError ? (
            <tr><td colSpan={6} className="p-8 text-center text-error">Failed to load records</td></tr>
          ) : candidates.length === 0 ? (
            <tr>
              <td className="py-32" colSpan={6}>
                <div className="flex flex-col items-center justify-center text-center opacity-60">
                  <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>person_search</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">No candidates found</h3>
                  <p className="font-body-md text-on-surface-variant max-w-sm mb-5">
                    No candidates match your current filters. Try adjusting your search or add a new candidate.
                  </p>
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="border border-outline-variant bg-white px-5 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            candidates.map((candidate) => {
              const avatar = getAvatarStyle(candidate.full_name);
              const skills = primarySkills(candidate);

              return (
                <tr
                  key={candidate.id}
                  className="group border-b border-outline-variant/50 hover:bg-surface-variant/10 cursor-pointer transition-colors"
                  onClick={() => onRowClick(candidate)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0"
                        style={{ backgroundColor: avatar.bg, color: avatar.fg }}
                        aria-hidden="true"
                      >
                        {getInitials(candidate.full_name)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-body-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                          {candidate.full_name}
                        </div>
                        {skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skills.map((skill, i) => (
                              <span
                                key={skill}
                                className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                  i === 0
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-surface-container-low text-on-surface-variant'
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-on-surface-variant mt-0.5">
                            {candidate.current_role || 'No role'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface tabular-nums">
                    {candidate.exp_years}y
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface">
                    {candidate.current_location || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${availabilityPillClass(candidate.availability_status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {candidate.availability_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-body-md text-on-surface text-right tabular-nums">
                    {candidate.expected_day_rate
                      ? `${candidate.currency} ${candidate.expected_day_rate}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusPillClass(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </section>
);
