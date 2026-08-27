/** Mirrors backend shared/utils/status-machine.ts */
export type AllocationStatus =
  | 'shortlisted'
  | 'screening'
  | 'interviewing'
  | 'offered'
  | 'placed'
  | 'rejected'
  | 'withdrawn';

const TRANSITIONS: Record<AllocationStatus, AllocationStatus[]> = {
  shortlisted: ['screening', 'rejected', 'withdrawn'],
  screening: ['shortlisted', 'interviewing', 'rejected', 'withdrawn'],
  interviewing: ['offered', 'rejected', 'withdrawn'],
  offered: ['placed', 'rejected', 'withdrawn'],
  placed: [],
  rejected: [],
  withdrawn: [],
};

export const ALLOCATION_STATUS_LABELS: Record<AllocationStatus, string> = {
  shortlisted: 'Shortlisted',
  screening: 'Screening',
  interviewing: 'Interviewing',
  offered: 'Offered',
  placed: 'Placed',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const ALL_ALLOCATION_STATUSES: AllocationStatus[] = [
  'shortlisted',
  'screening',
  'interviewing',
  'offered',
  'placed',
  'rejected',
  'withdrawn',
];

// The happy-path pipeline, in order, for the stepper visual. rejected and
// withdrawn are terminal off-ramps and sit outside this track.
export const ALLOCATION_PIPELINE: AllocationStatus[] = [
  'shortlisted',
  'screening',
  'interviewing',
  'offered',
  'placed',
];

export function isOffRamp(status: AllocationStatus): boolean {
  return status === 'rejected' || status === 'withdrawn';
}

// How far along the pipeline a status sits (0-based index), or -1 for
// off-ramp statuses that aren't on the track.
export function getPipelineIndex(status: AllocationStatus): number {
  return ALLOCATION_PIPELINE.indexOf(status);
}

export function getAllowedNextStatuses(current: AllocationStatus): AllocationStatus[] {
  return TRANSITIONS[current] ?? [];
}

/** Statuses shown in the row dropdown: current + valid next steps. */
export function getSelectableStatuses(current: AllocationStatus): AllocationStatus[] {
  const next = getAllowedNextStatuses(current);
  if (next.length === 0) return [current];
  return [current, ...next];
}

export function canTransition(from: AllocationStatus, to: AllocationStatus): boolean {
  if (from === to) return true;
  return getAllowedNextStatuses(from).includes(to);
}
