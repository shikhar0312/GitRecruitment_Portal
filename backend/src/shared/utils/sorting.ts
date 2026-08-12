export interface SortingQuery {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function getSorting(
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
  allowedFields: string[],
  defaultField: string
): { [key: string]: 'asc' | 'desc' } {
  const field =
    sortBy && allowedFields.includes(sortBy) ? sortBy : defaultField
  const order = sortOrder ?? 'desc'

  return { [field]: order }
}