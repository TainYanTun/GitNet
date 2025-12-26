import React, { useState, useEffect } from "react";
import { Repository, Branch, Commit } from "@shared/types";
import { useTheme } from "./ThemeContext";
import { useToast } from "./ToastContext";
import { BranchExplorer } from "./BranchExplorer";
import { CommitMiniLog } from "./CommitMiniLog";
import { StashList } from "./StashList";
import { CommitGraph } from "./CommitGraph"; // Import CommitGraph
import { CommitDetails } from "./CommitDetails"; // Import CommitDetails

interface MainLayoutProps {
  repository: Repository;
  onCloseRepository: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  repository,
  onCloseRepository,
}) => {
  const { toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const fetchedBranches = await window.gitnetAPI.getBranches(
          repository.path,
        );
        setBranches(fetchedBranches);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
        showToast("Failed to load branches.", "error");
      }
    };

    const fetchCommits = async () => {
      try {
        const fetchedCommits = await window.gitnetAPI.getCommits(
          repository.path,
          1000,
        ); // Fetch up to 1000 commits
        setCommits(fetchedCommits);
      } catch (error) {
        console.error("Failed to fetch commits:", error);
        showToast("Failed to load commits.", "error");
      }
    };

    fetchBranches();
    fetchCommits();

    const handleBranchesUpdated = () => {
      fetchBranches(); // Re-fetch branches when updated
    };

    const handleCommitsUpdated = () => {
      fetchCommits(); // Re-fetch commits when updated
    };

    if (window.gitnetAPI) {
      window.gitnetAPI.onBranchesUpdated(handleBranchesUpdated);
      window.gitnetAPI.onCommitsUpdated(handleCommitsUpdated);
    }

    return () => {
      if (window.gitnetAPI) {
        window.gitnetAPI.onBranchesUpdated(handleBranchesUpdated)(); // Cleanup
        window.gitnetAPI.onCommitsUpdated(handleCommitsUpdated)(); // Cleanup
      }
    };
  }, [repository.path, showToast]);

  const handleBranchSelect = (branchName: string) => {
    console.log("Selected branch:", branchName);
    // TODO: Implement actual branch selection logic (e.g., checkout)
    // For now, we'll just log and potentially highlight
  };

  const handleCommitSelect = (commit: Commit) => {
    setSelectedCommit(commit);
  };

  // Keyboard shortcut for closing the right sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCommit(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-zed-bg dark:bg-zed-dark-bg text-zed-text dark:text-zed-dark-text overflow-hidden">
      {/* Title Bar / Toolbar */}
      <div className="h-10 flex items-center justify-between px-4 bg-zed-bg dark:bg-zed-dark-bg border-b border-zed-border dark:border-zed-dark-border select-none shrink-0 draggable">
        <div className="flex items-center gap-3">
          {/* Window Controls Placeholder (Mac) */}
          <div className="w-14 no-drag"></div>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded hover:bg-zed-element dark:hover:bg-zed-dark-element text-zed-muted hover:text-zed-text transition-colors no-drag ${!isSidebarOpen ? "text-zed-accent dark:text-zed-accent" : ""}`}
            title="Toggle Sidebar"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <span className="text-xs font-medium text-zed-muted uppercase tracking-wider pl-2 border-l border-zed-border dark:border-zed-dark-border">
            {repository.name}
          </span>
        </div>

        <div className="flex items-center gap-2 no-drag">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-zed-element text-zed-muted hover:text-zed-text transition-colors"
            title="Toggle Theme"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </button>

          <button
            onClick={onCloseRepository}
            className="p-1.5 rounded hover:bg-zed-element text-zed-muted hover:text-commit-fix transition-colors"
            title="Close Repository"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Project Explorer Style) */}
        {isSidebarOpen && (
          <div className="w-60 flex-shrink-0 flex flex-col border-r border-zed-border dark:border-zed-dark-border bg-zed-surface dark:bg-zed-dark-surface animate-slide-in-left">
            <div className="px-3 py-2 text-xs font-bold text-zed-muted dark:text-zed-dark-muted uppercase tracking-wider flex items-center justify-between group">
              <span>Project Info</span>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
              <div className="space-y-1">
                <div className="text-[11px] text-zed-muted uppercase">
                  Repository
                </div>
                <div
                  className="text-sm text-zed-text dark:text-zed-dark-text truncate"
                  title={repository.path}
                >
                  {repository.name}
                </div>
                <div className="text-xs text-zed-muted dark:text-zed-dark-muted font-mono truncate opacity-60">
                  {repository.path}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-zed-muted dark:text-zed-dark-muted uppercase">
                  Status
                </div>
                <div className="flex items-center gap-2 text-sm text-zed-text dark:text-zed-dark-text">
                  <span className="w-2 h-2 rounded-full bg-zed-accent"></span>
                  <span>{repository.currentBranch}</span>
                </div>
                <div className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted">
                  HEAD: {repository.headCommit.substring(0, 7)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="px-3 py-2 text-xs text-zed-muted dark:text-zed-dark-muted uppercase tracking-wider flex items-center justify-between group">
                  <span>Branches</span>
                </div>
                <BranchExplorer
                  branches={branches}
                  currentBranchName={repository.currentBranch}
                  onBranchSelect={handleBranchSelect}
                />
              </div>

              {/* Stash List */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs text-zed-muted dark:text-zed-dark-muted uppercase tracking-wider flex items-center justify-between group">
                  <span>Stash List</span>
                </div>
                <StashList repoPath={repository.path} />
              </div>

              <div className="space-y-1">
                <div className="px-3 py-2 text-xs text-zed-muted dark:text-zed-dark-muted uppercase tracking-wider flex items-center justify-between group">
                  <span>Recent Commits</span>
                </div>
                <CommitMiniLog repoPath={repository.path} onCommitSelect={handleCommitSelect} />
              </div>
            </div>
          </div>
        )}

        {/* Editor Area (Graph) */}
        <div className="flex-1 flex flex-col bg-zed-bg dark:bg-zed-dark-bg relative">
          {/* Canvas Area */}
          <div className="flex-1 overflow-hidden relative group">
            <CommitGraph commits={commits} onCommitSelect={handleCommitSelect} />
          </div>
        </div>

        {/* Right Sidebar for Commit Details */}
        {selectedCommit && (
          <div className="w-80 flex-shrink-0 flex flex-col border-l border-zed-border dark:border-zed-dark-border bg-zed-surface dark:bg-zed-dark-surface animate-slide-in-right">
            <div className="px-3 py-2 text-xs font-bold text-zed-muted dark:text-zed-dark-muted uppercase tracking-wider flex items-center justify-between group">
              <span>Commit Details</span>
              <button
                onClick={() => setSelectedCommit(null)}
                className="p-1.5 rounded hover:bg-zed-element dark:hover:bg-zed-dark-element text-zed-muted hover:text-zed-text transition-colors no-drag"
                title="Close Commit Details"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CommitDetails commit={selectedCommit} repoPath={repository.path} />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 flex items-center justify-between px-3 bg-zed-surface dark:bg-zed-dark-surface border-t border-zed-border dark:border-zed-dark-border text-[11px] text-zed-text dark:text-zed-dark-text select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:text-zed-accent cursor-pointer transition-colors">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>{repository.currentBranch}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zed-muted dark:text-zed-dark-muted">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Sync</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zed-muted dark:text-zed-dark-muted">
          <span>UTF-8</span>
          <span>GitNet v0.1.0</span>
        </div>
      </div>
    </div>
  );
};
