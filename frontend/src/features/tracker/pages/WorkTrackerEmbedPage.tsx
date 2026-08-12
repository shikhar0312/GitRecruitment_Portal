import React from 'react';
import { useNavigate } from 'react-router-dom';

export const WorkTrackerEmbedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Header bar to allow navigation back to the portal */}
      <header className="flex items-center justify-between px-6 py-4 bg-surface shadow-sm border-b border-outline-variant z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-brand flex items-center justify-center">
             <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
          </div>
          <div>
            <h1 className="text-title-lg font-bold text-on-surface">WorkTracker</h1>
            <p className="text-body-sm text-on-surface-variant">Embedded Mode</p>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary-container/20 rounded-md transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span className="font-medium text-sm">Back to Portal Login</span>
        </button>
      </header>

      {/* Embedded WorkTracker Application */}
      <main className="flex-1 w-full bg-surface-container-lowest">
        <iframe
          src="http://localhost:8080"
          title="WorkTracker Frontend"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </main>
    </div>
  );
};
