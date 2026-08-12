import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavBar } from './TopNavBar';

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full max-w-full overflow-hidden bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 space-y-gutter relative box-border w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
