import React, { useState } from 'react';
import { Branch } from '@shared/types';
import { groupBranches, BranchGroup } from '../utils/branch-utils';

interface BranchExplorerProps {
  branches: Branch[];
  currentBranchName: string;
  onBranchSelect: (branchName: string) => void;
}

export const BranchExplorer: React.FC<BranchExplorerProps> = ({
  branches,
  currentBranchName,
  onBranchSelect,
}) => {
  const [groupedBranchState, setGroupedBranchState] = useState<BranchGroup[]>(() =>
    groupBranches(branches, currentBranchName)
  );

  // Update grouped branches when the branches prop changes
  React.useEffect(() => {
    setGroupedBranchState(groupBranches(branches, currentBranchName));
  }, [branches, currentBranchName]);

  const toggleFolder = (groupName: string) => {
    setGroupedBranchState(prevState =>
      prevState.map(group =>
        group.name === groupName ? { ...group, isOpen: !group.isOpen } : group
      )
    );
  };

  const renderBranch = (branch: Branch) => (
    <div
      key={branch.name}
      className={`flex items-center gap-1 px-2 py-1 text-sm rounded cursor-pointer transition-colors
                  ${branch.name === currentBranchName
                      ? 'bg-zed-accent text-white'
                      : 'hover:bg-zed-element dark:hover:bg-zed-dark-element'
                  }`}
      onClick={() => onBranchSelect(branch.name)}
      title={branch.name}
    >
      <svg
        className={`w-3 h-3 ${branch.name === currentBranchName ? 'text-white' : 'text-zed-muted dark:text-zed-dark-muted'}`}
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
      <span className="truncate">{branch.name.split('/').pop()}</span>
      {branch.name === currentBranchName && (
        <span className="ml-auto text-xs font-mono opacity-80">(HEAD)</span>
      )}
    </div>
  );

  const renderFolder = (group: BranchGroup) => (
    <div key={group.name} className="space-y-0.5">
      <div
        className="flex items-center gap-1 px-2 py-1 text-xs rounded cursor-pointer transition-colors text-zed-muted hover:bg-zed-element dark:hover:bg-zed-dark-element"
        onClick={() => toggleFolder(group.name)}
      >
        <svg
          className={`w-3 h-3 transform transition-transform ${group.isOpen ? 'rotate-90' : ''}`}
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
        <span className="uppercase tracking-wider">{group.name}</span>
      </div>
      {group.isOpen && (
        <div className="pl-4 space-y-0.5">
          {group.branches.map(branch => renderBranch(branch))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-1">
      {groupedBranchState.map(group =>
        group.isFolder ? renderFolder(group) : renderBranch(group.branches[0])
      )}
    </div>
  );
};
