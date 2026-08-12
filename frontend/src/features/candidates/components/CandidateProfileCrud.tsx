import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hasPermission } from '../../../lib/rbac';
import { getApiErrorMessage } from '../../../lib/errors';
import { queryKeys } from '../../../lib/query-keys';
import {
  addCandidateSkill,
  deleteCandidateSkill,
  addCandidateWorkHistory,
  deleteCandidateWorkHistory,
  addCandidateEducation,
  deleteCandidateEducation,
} from '../../../api/services/candidates.service';
import type { Candidate } from '../../../types/candidate.types';

interface CandidateProfileCrudProps {
  candidateId: string;
  candidate: Candidate;
  activeTab: 'skills' | 'work_history' | 'education';
}

export const CandidateProfileCrud: React.FC<CandidateProfileCrudProps> = ({
  candidateId,
  candidate,
  activeTab,
}) => {
  const queryClient = useQueryClient();
  const [skillName, setSkillName] = useState('');
  const [workForm, setWorkForm] = useState({ company_name: '', role_title: '', start_date: '' });
  const [eduForm, setEduForm] = useState({ institution: '', degree: '' });
  const [actionError, setActionError] = useState('');
  const canEdit = hasPermission('edit_candidate');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.candidates.detail(candidateId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
  };

  const handleMutationError = (error: unknown, fallback: string) => {
    setActionError(getApiErrorMessage(error, fallback));
  };

  const addSkill = useMutation({
    mutationFn: () => addCandidateSkill(candidateId, { skill: skillName, is_primary: false }),
    onSuccess: () => { setSkillName(''); setActionError(''); invalidate(); },
    onError: (error) => handleMutationError(error, 'Failed to add skill'),
  });

  const removeSkill = useMutation({
    mutationFn: (skillId: string) => deleteCandidateSkill(candidateId, skillId),
    onSuccess: () => { setActionError(''); invalidate(); },
    onError: (error) => handleMutationError(error, 'Failed to remove skill'),
  });

  const addWork = useMutation({
    mutationFn: () =>
      addCandidateWorkHistory(candidateId, {
        ...workForm,
        employment_type: 'full_time',
        start_date: new Date(workForm.start_date).toISOString(),
        is_current: false,
      }),
    onSuccess: () => { setWorkForm({ company_name: '', role_title: '', start_date: '' }); setActionError(''); invalidate(); },
    onError: (error) => handleMutationError(error, 'Failed to add work entry'),
  });

  const removeWork = useMutation({
    mutationFn: (entryId: string) => deleteCandidateWorkHistory(candidateId, entryId),
    onSuccess: () => { setActionError(''); invalidate(); },
    onError: (error) => handleMutationError(error, 'Failed to remove work entry'),
  });

  const addEdu = useMutation({
    mutationFn: () => addCandidateEducation(candidateId, eduForm),
    onSuccess: () => { setEduForm({ institution: '', degree: '' }); setActionError(''); invalidate(); },
    onError: (error) => handleMutationError(error, 'Failed to add education'),
  });

  const removeEdu = useMutation({
    mutationFn: (entryId: string) => deleteCandidateEducation(candidateId, entryId),
    onSuccess: () => { setActionError(''); invalidate(); },
    onError: (error) => handleMutationError(error, 'Failed to remove education'),
  });

  if (!canEdit) return null;

  if (activeTab === 'skills') {
    return (
      <div className="mt-4 pt-4 border-t border-outline-variant">
        {actionError && <p className="text-sm text-error mb-2">{actionError}</p>}
        <form onSubmit={(e) => { e.preventDefault(); if (skillName.trim()) addSkill.mutate(); }} className="flex gap-2">
          <input value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="Add skill..." className="flex-1 px-3 py-2 border border-outline-variant rounded-md text-sm" />
          <button type="submit" disabled={addSkill.isPending} className="px-3 py-2 bg-primary text-white text-sm rounded-md">Add</button>
        </form>
        {candidate.skills?.map((s) => (
          <div key={s.id} className="flex justify-end mt-1">
            <button type="button" disabled={removeSkill.isPending} onClick={() => removeSkill.mutate(s.id)} className="text-xs text-error hover:underline disabled:opacity-50">Remove {s.skill}</button>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'work_history') {
    return (
      <div className="mt-4 pt-4 border-t border-outline-variant space-y-2">
        {actionError && <p className="text-sm text-error">{actionError}</p>}
        <input value={workForm.role_title} onChange={(e) => setWorkForm({ ...workForm, role_title: e.target.value })} placeholder="Role title" className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm" />
        <input value={workForm.company_name} onChange={(e) => setWorkForm({ ...workForm, company_name: e.target.value })} placeholder="Company" className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm" />
        <input type="date" value={workForm.start_date} onChange={(e) => setWorkForm({ ...workForm, start_date: e.target.value })} className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm" />
        <button type="button" onClick={() => addWork.mutate()} disabled={addWork.isPending || !workForm.company_name || !workForm.role_title || !workForm.start_date} className="px-3 py-2 bg-primary text-white text-sm rounded-md">Add Work Entry</button>
        {candidate.work_history?.map((w) => (
          <button key={w.id} type="button" disabled={removeWork.isPending} onClick={() => removeWork.mutate(w.id)} className="block text-xs text-error hover:underline disabled:opacity-50">Remove {w.role_title} at {w.company_name}</button>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-outline-variant space-y-2">
      {actionError && <p className="text-sm text-error">{actionError}</p>}
      <input value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} placeholder="Institution" className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm" />
      <input value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} placeholder="Degree" className="w-full px-3 py-2 border border-outline-variant rounded-md text-sm" />
      <button type="button" onClick={() => addEdu.mutate()} disabled={addEdu.isPending || !eduForm.institution || !eduForm.degree} className="px-3 py-2 bg-primary text-white text-sm rounded-md">Add Education</button>
      {!candidate.education?.length ? (
        <p className="text-sm text-on-surface-variant">No education recorded.</p>
      ) : (
        candidate.education.map((e) => (
          <div key={e.id} className="border border-outline-variant rounded-lg p-3 flex justify-between">
            <div><div className="font-semibold text-sm">{e.degree}</div><div className="text-xs text-on-surface-variant">{e.institution}</div></div>
            <button type="button" disabled={removeEdu.isPending} onClick={() => removeEdu.mutate(e.id)} className="text-xs text-error hover:underline disabled:opacity-50">Remove</button>
          </div>
        ))
      )}
    </div>
  );
};
