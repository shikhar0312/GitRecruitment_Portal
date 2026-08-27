export function formatUnderscoreLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

export function formatDate(value: string | null | undefined, fallback = 'TBD'): string {
  if (!value) return fallback;
  return new Date(value).toLocaleDateString();
}

export function formatBudget(
  budgetMin: number | null | undefined,
  budgetMax: number | null | undefined,
  currency: string
): string {
  if (budgetMin == null) return 'N/A';
  return `${currency} ${budgetMin}-${budgetMax ?? budgetMin}`;
}

// Same underlying budget_min/budget_max figures are used for both
// permanent and contract requirements — this only changes the label so
// it's clear which kind of number is being shown, rather than a bare
// "Budget" that could be mistaken for either.
export function getBudgetLabel(hiringType: string): string {
  return hiringType === 'contract' ? 'Rate (Monthly)' : 'CTC (Annual)';
}

// Colour margin % by health so leadership can scan a column and instantly
// see strong vs thin deals. Thresholds are deliberately simple: ≥15% is a
// healthy margin, 0–15% is thin (watch), below 0 is loss-making. Kept in
// one place so every table/card that shows a margin agrees on the bands.
export function getMarginHealthClass(marginPct: number): string {
  if (marginPct < 0) return 'text-error';
  if (marginPct < 15) return 'text-amber-600';
  return 'text-green-700';
}

// Derives when a requirement stops being "open" from the month it was
// created plus its TTL. Nothing is stored — the expiry is computed at read
// time so no background job is needed and HR's manual status control is never
// overridden; the result just drives an informational badge.
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function getRequirementExpiry(
  createdAt: string | Date,
  ttlMonths: number
): { expiresAt: Date; isExpired: boolean; daysRemaining: number } {
  const expiresAt = addMonths(new Date(createdAt), ttlMonths);
  const msRemaining = expiresAt.getTime() - Date.now();
  return {
    expiresAt,
    isExpired: msRemaining < 0,
    daysRemaining: Math.ceil(msRemaining / (1000 * 60 * 60 * 24)),
  };
}

export function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
