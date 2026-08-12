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

export function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
