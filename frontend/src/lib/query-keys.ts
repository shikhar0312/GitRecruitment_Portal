export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    aggregates: () => [...queryKeys.dashboard.all, 'aggregates'] as const,
  },
  // Single source of truth for the customers cache. Previously this was split
  // across two separate keys ('clients' and 'companies'), which meant renaming
  // or deleting a customer didn't invalidate the dropdown options used
  // elsewhere (e.g. the requirement form). Everything now shares this one key.
  customers: {
    all: ['customers'] as const,
    list: (search: string, page: number) =>
      [...queryKeys.customers.all, 'list', { search, page }] as const,
    activeList: () => [...queryKeys.customers.all, 'active-list'] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: () => [...queryKeys.roles.all, 'list'] as const,
  },
  requirements: {
    all: ['requirements'] as const,
    list: (filters: Record<string, string | number>) =>
      [...queryKeys.requirements.all, 'list', filters] as const,
    openList: () => [...queryKeys.requirements.all, 'open-list'] as const,
    detail: (id: string) => [...queryKeys.requirements.all, 'detail', id] as const,
    suggested: (id: string) => [...queryKeys.requirements.all, 'suggested', id] as const,
  },
  candidates: {
    all: ['candidates'] as const,
    list: (filters: { search: string; status: string; page: number }) =>
      [...queryKeys.candidates.all, 'list', filters] as const,
    activeList: () => [...queryKeys.candidates.all, 'active-list'] as const,
    detail: (id: string) => [...queryKeys.candidates.all, 'detail', id] as const,
  },
  allocations: {
    all: ['allocations'] as const,
    list: (filters: { status: string; page: number }) =>
      [...queryKeys.allocations.all, 'list', filters] as const,
    placedList: () => [...queryKeys.allocations.all, 'placed-list'] as const,
    detail: (id: string) => [...queryKeys.allocations.all, 'detail', id] as const,
  },
  tracker: {
    all: ['tracker'] as const,
    list: (page: number, filters?: Record<string, string>) =>
      [...queryKeys.tracker.all, 'list', { page, ...filters }] as const,
  },
} as const;
