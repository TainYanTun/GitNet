import React, { useState, useEffect } from 'react';
import { Branch } from '@shared/types';
import { groupBranches, BranchGroup } from '../utils/branch-utils';

interface BranchCheckoutProps {
  branches: Branch[];
  currentBranchName: string;
  onBranchSelect: (branchName: string) => void;
}

export const BranchCheckout: React.FC<BranchCheckoutProps> = ({
  branches,
  currentBranchName,
  onBranchSelect,
}) => {
  const [localGroups, setLocalGroups] = useState<BranchGroup[]>([]);
  const [remoteGroups, setRemoteGroups] = useState<BranchGroup[]>([]);
  const [isLocalOpen, setIsLocalOpen] = useState(true);
  const [isRemoteOpen, setIsRemoteOpen] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const filtered = branches.filter(b => 
      b.name.toLowerCase().includes(search.toLowerCase())
    );
    const local = filtered.filter((b) => !b.isRemote);
    const remote = filtered.filter((b) => b.isRemote);
    setLocalGroups(groupBranches(local, currentBranchName));
    setRemoteGroups(groupBranches(remote, currentBranchName));
  }, [branches, currentBranchName, search]);

  const toggleLocalFolder = (groupName: string) => {
    setLocalGroups((prevState) =>
      prevState.map((group) =>
        group.name === groupName ? { ...group, isOpen: !group.isOpen } : group,
      ),
    );
  };

  const toggleRemoteFolder = (groupName: string) => {
    setRemoteGroups((prevState) =>
      prevState.map((group) =>
        group.name === groupName ? { ...group, isOpen: !group.isOpen } : group,
      ),
    );
  };

  const renderBranch = (branch: Branch) => (
    <div
      key={`checkout-branch-${branch.name}`}
      className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg cursor-pointer transition-all border
                  ${
                    branch.name === currentBranchName
                      ? 'bg-zed-accent/10 border-zed-accent text-zed-accent shadow-sm'
                      : 'hover:bg-zed-element dark:hover:bg-zed-dark-element border-transparent text-zed-text dark:text-zed-dark-text'
                  }`}
      onClick={() => onBranchSelect(branch.name)}
    >
      <div className={`p-2 rounded-md ${branch.name === currentBranchName ? 'bg-zed-accent text-white' : 'bg-zed-element dark:bg-zed-dark-element text-zed-muted'}`}>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 13V7m0 6l-3-3m3 3l3-3"
          />
        </svg>
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="truncate font-semibold tracking-tight">
          {branch.name}
        </span>
        <span className="text-[10px] font-mono opacity-50 truncate">
          {branch.objectName}
        </span>
      </div>
      {branch.name === currentBranchName && (
        <div className="ml-auto flex items-center gap-1.5 bg-zed-accent text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
           <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
           Active
        </div>
      )}
    </div>
  );

  const renderFolder = (
    group: BranchGroup,
    toggleFn: (name: string) => void,
  ) => (
    <div key={`checkout-folder-${group.name}`} className="space-y-1">
      <div
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors text-zed-muted dark:text-zed-dark-muted hover:text-zed-text dark:hover:text-zed-dark-text hover:bg-zed-element dark:hover:bg-zed-dark-element select-none"
        onClick={() => toggleFn(group.name)}
      >
        <svg
          className={`w-3 h-3 transform transition-transform duration-200 ${
            group.isOpen ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="truncate uppercase tracking-wider">{group.name}</span>
        <span className="ml-auto text-[10px] opacity-40">{group.branches.length}</span>
      </div>
      {group.isOpen && (
        <div className="pl-4 space-y-1 border-l-2 border-zed-border dark:border-zed-dark-border ml-4 mt-1">
          {group.branches.map((branch) => renderBranch(branch))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-zed-text dark:text-zed-dark-text tracking-tight">
            Checkout Branch
          </h1>
          <p className="text-sm text-zed-muted dark:text-zed-dark-muted opacity-70">
            Switch between local and remote branches. Uncommitted changes will be carried over.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zed-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search branches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zed-element/50 dark:bg-zed-dark-element/50 border border-zed-border dark:border-zed-dark-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zed-accent/50 focus:border-zed-accent transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        <section>
          <div 
            className="flex items-center gap-2 px-1 py-2 mb-2 text-xs font-bold text-zed-muted dark:text-zed-dark-muted uppercase tracking-[0.2em] cursor-pointer hover:text-zed-text transition-colors"
            onClick={() => setIsLocalOpen(!isLocalOpen)}
          >
            <svg
              className={`w-3 h-3 transform transition-transform duration-200 ${isLocalOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Local Branches
          </div>
          {isLocalOpen && (
            <div className="space-y-1">
              {localGroups.map((group) =>
                group.isFolder
                  ? renderFolder(group, toggleLocalFolder)
                  : renderBranch(group.branches[0]),
              )}
              {localGroups.length === 0 && (
                <div className="px-4 py-8 text-center border-2 border-dashed border-zed-border dark:border-zed-dark-border rounded-lg text-sm text-zed-muted italic">
                  No local branches found
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <div 
            className="flex items-center gap-2 px-1 py-2 mb-2 text-xs font-bold text-zed-muted dark:text-zed-dark-muted uppercase tracking-[0.2em] cursor-pointer hover:text-zed-text transition-colors"
            onClick={() => setIsRemoteOpen(!isRemoteOpen)}
          >
            <svg
              className={`w-3 h-3 transform transition-transform duration-200 ${isRemoteOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Remote Branches
          </div>
          {isRemoteOpen && (
            <div className="space-y-1">
              {remoteGroups.map((group) =>
                group.isFolder
                  ? renderFolder(group, toggleRemoteFolder)
                  : renderBranch(group.branches[0]),
              )}
              {remoteGroups.length === 0 && (
                <div className="px-4 py-8 text-center border-2 border-dashed border-zed-border dark:border-zed-dark-border rounded-lg text-sm text-zed-muted italic">
                  No remote branches found
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
