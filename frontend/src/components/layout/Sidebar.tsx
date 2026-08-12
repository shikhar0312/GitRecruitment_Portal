import React from 'react';
import { NavLink } from 'react-router-dom';
import { hasPermission, hasRole } from '../../lib/rbac';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const handleLogout = useAuthStore((state) => state.logout);

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 flex-shrink-0 sticky top-0 bg-[#1f2937] shadow-sm z-50">
      <div className="p-6 flex flex-col gap-1">
        <div className="font-headline-md text-headline-md font-bold text-surface-container-lowest">GIT Software Technologies</div>
        <div className="text-[12px] uppercase tracking-wider text-surface-container-lowest/50 font-bold">RMS Portal</div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {hasPermission('view_dashboard') && (
        <NavLink 
          to="/"
          end
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
              isActive 
                ? 'text-primary border-l-4 border-primary bg-surface-variant/10' 
                : 'text-surface-container-lowest/80 hover:bg-surface-variant/5 hover:text-surface-container-lowest'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </>
          )}
        </NavLink>
        )}

        {hasPermission('view_customers') && (
          <NavLink 
            to="/customers"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                isActive 
                  ? 'text-primary border-l-4 border-primary bg-surface-variant/10' 
                  : 'text-surface-container-lowest/80 hover:bg-surface-variant/5 hover:text-surface-container-lowest'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>domain</span>
                <span className="font-label-md text-label-md">Customers</span>
              </>
            )}
          </NavLink>
        )}



        {hasPermission('view_requirements') && (
          <NavLink 
            to="/requirements"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                isActive 
                  ? 'text-primary border-l-4 border-primary bg-surface-variant/10' 
                  : 'text-surface-container-lowest/80 hover:bg-surface-variant/5 hover:text-surface-container-lowest'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>assignment</span>
                <span className="font-label-md text-label-md">Requirements</span>
              </>
            )}
          </NavLink>
        )}

        {hasPermission('view_candidates') && (
          <NavLink 
            to="/candidates"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                isActive 
                  ? 'text-primary border-l-4 border-primary bg-surface-variant/10' 
                  : 'text-surface-container-lowest/80 hover:bg-surface-variant/5 hover:text-surface-container-lowest'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>badge</span>
                <span className="font-label-md text-label-md">Candidates</span>
              </>
            )}
          </NavLink>
        )}

        {hasPermission('view_allocations') && (
          <NavLink 
            to="/allocations"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                isActive 
                  ? 'text-primary border-l-4 border-primary bg-surface-variant/10' 
                  : 'text-surface-container-lowest/80 hover:bg-surface-variant/5 hover:text-surface-container-lowest'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>account_tree</span>
                <span className="font-label-md text-label-md">Allocations</span>
              </>
            )}
          </NavLink>
        )}
        
        {hasPermission('view_tracker') && (
          <NavLink 
            to="/tracker"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                isActive 
                  ? 'text-primary border-l-4 border-primary bg-surface-variant/10' 
                  : 'text-surface-container-lowest/80 hover:bg-surface-variant/5 hover:text-surface-container-lowest'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>insights</span>
                <span className="font-label-md text-label-md">Tracker</span>
              </>
            )}
          </NavLink>
        )}

        {hasRole('admin') && (
          <NavLink
            to="/admin/roles"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                isActive
                  ? 'text-primary border-l-4 border-primary bg-surface-variant/10'
                  : 'text-surface-container-lowest/80 hover:bg-surface-variant/5 hover:text-surface-container-lowest'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>work</span>
                <span className="font-label-md text-label-md">Job Roles</span>
              </>
            )}
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-surface-variant/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs">
            {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'GT'}
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-surface-container-lowest text-xs font-semibold truncate max-w-[120px]">{user?.full_name || 'Admin Portal'}</span>
            <span className="text-surface-container-lowest/50 text-[10px] capitalize">{user?.role ? user.role.replace('_', ' ') : 'System'}</span>
          </div>
          <button onClick={handleLogout} className="text-surface-container-lowest/50 hover:text-error transition-colors" title="Logout">
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
