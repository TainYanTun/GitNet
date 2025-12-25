import { Branch } from "@shared/types";

export interface BranchGroup {
  name: string;
  branches: Branch[];
  isFolder: boolean;
  isOpen?: boolean; // For UI state
}

export const groupBranches = (branches: Branch[], currentBranchName: string): BranchGroup[] => {
  const grouped: { [key: string]: Branch[] } = {};
  const topLevel: Branch[] = [];

  branches.forEach(branch => {
    // Treat main, master, develop as top-level branches
    if (branch.name === 'main' || branch.name === 'master' || branch.name === 'develop') {
      topLevel.push(branch);
    } else {
      const parts = branch.name.split('/');
      if (parts.length > 1) {
        const groupName = parts[0];
        if (!grouped[groupName]) {
          grouped[groupName] = [];
        }
        grouped[groupName].push(branch);
      } else {
        topLevel.push(branch); // Branches without '/' are also top-level
      }
    }
  });

  const result: BranchGroup[] = [];

  // Add top-level branches
  topLevel.forEach(branch => {
    result.push({
      name: branch.name,
      branches: [branch],
      isFolder: false,
      isOpen: false,
    });
  });

  // Add grouped branches (folders)
  Object.keys(grouped).sort().forEach(groupName => {
    const groupBranches = grouped[groupName].sort((a, b) => a.name.localeCompare(b.name));
    const containsCurrentBranch = groupBranches.some(b => b.name === currentBranchName);

    result.push({
      name: groupName,
      branches: groupBranches,
      isFolder: true,
      isOpen: containsCurrentBranch, // Open folder if it contains the current branch
    });
  });

  // Sort top-level branches, ensuring current branch is at the top
  result.sort((a, b) => {
    if (a.name === currentBranchName) return -1;
    if (b.name === currentBranchName) return 1;
    return a.name.localeCompare(b.name);
  });

  return result;
};