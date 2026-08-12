import { downloadCsv } from './export-csv';
import type { Candidate } from '../types/candidate.types';

export function exportCandidatesToCsv(candidates: Candidate[]) {
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Role',
    'Experience (yrs)',
    'Location',
    'Availability',
    'Day Rate',
    'Currency',
    'Status',
  ];

  const rows = candidates.map((c) => [
    c.full_name,
    c.email,
    c.phone,
    c.current_role ?? '',
    String(c.exp_years),
    c.current_location ?? '',
    c.availability_status.replace(/_/g, ' '),
    c.expected_day_rate != null ? String(c.expected_day_rate) : '',
    c.currency,
    c.status,
  ]);

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`candidates-${date}.csv`, headers, rows);
}
