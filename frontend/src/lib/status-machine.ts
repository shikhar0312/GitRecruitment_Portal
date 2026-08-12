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
