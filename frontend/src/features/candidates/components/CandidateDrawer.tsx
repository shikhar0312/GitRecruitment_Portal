import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { hasPermission } from '../../../lib/rbac';
import { formatUnderscoreLabel } from '../../../lib/formatters';
import { useCandidateDetail } from '../hooks/useCandidateDetail';
import { CandidateProfileCrud } from './CandidateProfileCrud';

type DrawerTab = 'overview' | 'skills' | 'work_history' | 'education';

interface CandidateDrawerProps {
  candidateId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  candidateId,
  isOpen,
  onClose,
  onEdit,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const { data: candidate, isLoading, isError } = useCandidateDetail(candidateId);

  useEffect(() => {
    if (isOpen) setActiveTab('overview');
  }, [candidateId, isOpen]);

  if (!isOpen || !candidateId) return null;

  const handleScheduleInterview = () => {
    if (!candidate) return;
    onClose();
    navigate(`/allocations?candidateId=${candidate.id}`);
  };

  const handleDownloadCv = () => {
    if (candidate?.resume_url) {
      window.open(candidate.resume_url, '_blank', 'noopener,noreferrer');
    }
  };

  const tabClass = (tab: DrawerTab) =>
    `px-4 py-4 font-label-md text-label-md whitespace-nowrap transition-colors ${
      activeTab === tab
        ? 'text-primary border-b-2 border-primary'
        : 'text-on-surface-variant hover:text-primary'
    }`;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={onClose} role="presentation" />
      <aside className="fixed right-0 top-0 h-screen w-full sm:w-[600px] bg-white shadow-2xl z-[70] flex flex-col border-l border-outline-variant">
        <div className="p-6 border-b border-outline-variant flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surface-container-low flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '32px' }}>
                person
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md">
                {candidate?.full_name ?? 'Loading...'}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {candidate?.current_role || 'No role'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex px-6 border-b border-outline-variant bg-surface-container-low/20 overflow-x-auto no-scrollbar">
          <button type="button" className={tabClass('overview')} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button type="button" className={tabClass('skills')} onClick={() => setActiveTab('skills')}>
            Skills
          </button>
          <button type="button" className={tabClass('work_history')} onClick={() => setActiveTab('work_history')}>
            Work History
          </button>
          <button type="button" className={tabClass('education')} onClick={() => setActiveTab('education')}>
            Education
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-background/50 custom-scrollbar">
          {isLoading ? (
            <LoadingState />
          ) : isError || !candidate ? (
            <p className="text-error text-center">Failed to load candidate profile.</p>
          ) : activeTab === 'overview' ? (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-on-surface mb-2">Contact Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-on-surface-variant block">Email</span>
                    <span>{candidate.email}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Phone</span>
                    <span>{candidate.phone}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Location</span>
                    <span>{candidate.current_location || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Experience</span>
                    <span>{candidate.exp_years} years</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Availability</span>
                    <span className="capitalize">{formatUnderscoreLabel(candidate.availability_status)}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Status</span>
                    <span className="capitalize">{candidate.status}</span>
                  </div>
                  {candidate.current_company && (
                    <div>
                      <span className="text-on-surface-variant block">Current Company</span>
                      <span>{candidate.current_company}</span>
                    </div>
                  )}
                  {candidate.expected_day_rate != null && (
                    <div>
                      <span className="text-on-surface-variant block">Day Rate</span>
                      <span>
                        {candidate.currency} {candidate.expected_day_rate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {candidate.notes && (
                <div>
                  <h4 className="font-bold text-on-surface mb-2">Notes</h4>
                  <p className="text-sm text-on-surface-variant">{candidate.notes}</p>
                </div>
              )}
            </div>
          ) : activeTab === 'skills' ? (
            <div>
              <h4 className="font-bold text-on-surface mb-4">Skills</h4>
              {!candidate.skills?.length ? (
                <p className="text-sm text-on-surface-variant">No skills recorded for this candidate.</p>
              ) : (
                <div className="space-y-3">
                  {candidate.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between border border-outline-variant rounded-lg px-4 py-3"
                    >
                      <div>
                        <span className="font-semibold text-on-surface">{skill.skill}</span>
                        {skill.is_primary && (
                          <span className="ml-2 text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      {skill.proficiency && (
                        <span className="text-xs text-on-surface-variant capitalize">{skill.proficiency}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <CandidateProfileCrud candidateId={candidate.id} candidate={candidate} activeTab="skills" />
            </div>
          ) : activeTab === 'work_history' ? (
            <div>
              <h4 className="font-bold text-on-surface mb-4">Work History</h4>
              {!candidate.work_history?.length ? (
                <p className="text-sm text-on-surface-variant">No work history recorded.</p>
              ) : (
                <div className="space-y-4">
                  {candidate.work_history.map((entry) => (
                    <div key={entry.id} className="border border-outline-variant rounded-lg p-4">
                      <div className="font-semibold text-on-surface">{entry.role_title}</div>
                      <div className="text-sm text-on-surface-variant">{entry.company_name}</div>
                      {entry.location && (
                        <div className="text-xs text-on-surface-variant">{entry.location}</div>
                      )}
                      <div className="text-xs text-on-surface-variant mt-1">
                        {new Date(entry.start_date).toLocaleDateString()} –{' '}
                        {entry.is_current
                          ? 'Present'
                          : entry.end_date
                            ? new Date(entry.end_date).toLocaleDateString()
                            : 'N/A'}
                      </div>
                      {entry.responsibilities && (
                        <p className="text-sm text-on-surface-variant mt-2">{entry.responsibilities}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <CandidateProfileCrud candidateId={candidate.id} candidate={candidate} activeTab="work_history" />
            </div>
          ) : (
            <div>
              <h4 className="font-bold text-on-surface mb-4">Education</h4>
              <CandidateProfileCrud candidateId={candidate.id} candidate={candidate} activeTab="education" />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-outline-variant bg-white flex gap-4">
          {hasPermission('edit_candidate') && candidate && onEdit && (
            <button type="button" onClick={onEdit} className="px-4 py-3 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low">
              Edit Profile
            </button>
          )}
          {hasPermission('create_allocation') && (
            <button
              type="button"
              onClick={handleScheduleInterview}
              disabled={!candidate}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-label-md text-label-md font-semibold hover:opacity-90 disabled:opacity-50"
            >
              Schedule Interview
            </button>
          )}
          <button
            type="button"
            onClick={handleDownloadCv}
            disabled={!candidate?.resume_url}
            title={candidate?.resume_url ? 'Download CV' : 'No CV uploaded for this candidate'}
            className="px-6 py-3 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download CV
          </button>
        </div>
      </aside>
    </>
  );
};
