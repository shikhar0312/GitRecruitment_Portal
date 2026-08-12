import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { DropdownMenu } from '../ui/DropdownMenu';
import { hasPermission } from '../../lib/rbac';

export const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const addMenuItems = [
    ...(hasPermission('create_customer') ? [{ id: 'customer', label: 'Add Customer', icon: 'domain', onClick: () => navigate('/customers?action=create') }] : []),
    ...(hasPermission('create_requirement') ? [{ id: 'job', label: 'Add Requirement', icon: 'assignment', onClick: () => navigate('/requirements?action=create') }] : []),
    ...(hasPermission('create_candidate') ? [{ id: 'candidate', label: 'Add Candidate', icon: 'badge', onClick: () => navigate('/candidates?action=create') }] : []),
    ...(hasPermission('create_allocation') ? [{ id: 'allocation', label: 'Add Allocation', icon: 'account_tree', onClick: () => navigate('/allocations?action=create') }] : []),
    ...(hasPermission('create_tracker') ? [{ id: 'tracker', label: 'Add to Tracker', icon: 'insights', onClick: () => navigate('/tracker?action=create') }] : []),
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/candidates?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="flex justify-between items-center w-full px-container-padding-desktop h-16 sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant">
      <div className="flex items-center gap-8">
        <div className="font-headline-sm text-headline-sm font-black text-on-surface">GIT Software Technologies RMS</div>
        <div className="hidden lg:flex items-center gap-6">
          <NavLink to="/" end className={({ isActive }) => isActive ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}>
            Dashboard
          </NavLink>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-brand text-sm focus:ring-2 focus:ring-primary/20 w-64"
            placeholder="Search candidates..."
            type="search"
          />
        </form>
        {addMenuItems.length > 0 && (
          <div className="relative">
            <button type="button" onClick={() => setIsAddMenuOpen((o) => !o)} className="bg-primary-container text-on-primary-container px-4 py-2 rounded-brand font-semibold text-sm hover:opacity-90 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add New
            </button>
            <DropdownMenu isOpen={isAddMenuOpen} onClose={() => setIsAddMenuOpen(false)} items={addMenuItems} />
          </div>
        )}
      </div>
    </header>
  );
};
