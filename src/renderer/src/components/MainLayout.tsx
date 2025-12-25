import React from 'react';
import { Repository } from '@shared/types';

interface MainLayoutProps {
  repository: Repository;
  onCloseRepository: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ repository, onCloseRepository }) => {
  return (
    <div className="h-full w-full flex flex-col bg-background-primary">
      {/* Header/Toolbar */}
      <div className="toolbar">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-text-primary">{repository.name}</h1>
          <span className="text-sm text-text-secondary">({repository.currentBranch})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCloseRepository}
            className="btn-ghost text-sm"
          >
            Close Repository
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="panel w-64 flex-shrink-0">
          <div className="panel-header">
            <h2 className="font-medium text-text-primary">Repository Info</h2>
          </div>
          <div className="panel-content">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Path</label>
                <p className="text-sm text-text-primary font-mono break-all">{repository.path}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Current Branch</label>
                <p className="text-sm text-text-primary">{repository.currentBranch}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Branches</label>
                <p className="text-sm text-text-primary">{repository.branches.length} branches</p>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Head Commit</label>
                <p className="text-sm text-text-primary font-mono">{repository.headCommit.substring(0, 7)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Area */}
        <div className="flex-1 flex flex-col">
          {/* Graph Container */}
          <div className="graph-container">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">Git Graph Coming Soon</h3>
                <p className="text-text-secondary">Interactive commit visualization will be implemented here using D3.js</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-background-secondary border-t border-border-light text-sm text-text-secondary">
        <div className="flex items-center gap-4">
          <span>Ready</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Repository: {repository.name}</span>
        </div>
      </div>
    </div>
  );
};
