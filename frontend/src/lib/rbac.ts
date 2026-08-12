import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../api/types/api.types';

/**
 * UI permissions aligned with backend route guards (rbac.middleware.ts).
 * Action permissions control buttons/forms; route access uses hasRole where needed.
 */
export type Permission =
  | 'view_dashboard'
  | 'view_customers'
  | 'create_customer'
  | 'edit_customer'
  | 'view_requirements'
  | 'create_requirement'
  | 'edit_requirement'
  | 'view_candidates'
  | 'create_candidate'
  | 'edit_candidate'
  | 'view_allocations'
  | 'create_allocation'
  | 'edit_allocation'
  | 'view_tracker'
  | 'create_tracker'
  | 'edit_tracker';

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'view_customers',
    'create_customer',
    'edit_customer',
    'view_requirements',
    'create_requirement',
    'edit_requirement',
    'view_candidates',
    'create_candidate',
    'edit_candidate',
    'view_allocations',
    'create_allocation',
    'edit_allocation',
    'view_tracker',
    'create_tracker',
    'edit_tracker',
  ],
  recruiter: [
    'view_dashboard',
    'view_customers',
    'view_requirements',
    'create_requirement',
    'edit_requirement',
    'view_candidates',
    'create_candidate',
    'edit_candidate',
    'view_allocations',
    'create_allocation',
    'edit_allocation',
    // Recruiters can see client/candidate/margin figures on the Tracker,
    // but can't create or edit entries — that stays with admin/finance.
    'view_tracker',
  ],
  account_manager: [
    'view_dashboard',
    'view_customers',
    'create_customer',
    'edit_customer',
    'view_requirements',
    'create_requirement',
    'edit_requirement',
    'view_allocations',
    'view_tracker',
  ],
  finance: ['view_dashboard', 'view_tracker', 'create_tracker', 'edit_tracker'],
  viewer: [
    'view_dashboard',
    'view_customers',
    'view_requirements',
    'view_candidates',
    'view_allocations',
    // Deliberately no view_tracker — viewer has no Tracker access,
    // matching the backend's requireTrackerViewer guard.
  ],
};

/** Routes restricted to specific roles (mirrors backend requireTrackerViewer). */
export const routeRoleAccess: Record<string, UserRole[]> = {
  '/tracker': ['admin', 'recruiter', 'account_manager', 'finance'],
};

export function hasRole(...roles: UserRole[]): boolean {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  return roles.includes(user.role);
}

export function hasPermission(permission: Permission): boolean {
  const user = useAuthStore.getState().user;
  if (!user) return false;

  const permissions = rolePermissions[user.role];
  if (!permissions) return false;

  return permissions.includes(permission);
}

export function canAccessRoute(pathname: string): boolean {
  const roles = routeRoleAccess[pathname];
  if (!roles) return true;
  return hasRole(...roles);
}
