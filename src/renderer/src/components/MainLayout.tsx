import React, { useState, useEffect } from "react";
import { Repository, Branch, Commit } from "@src/shared/types";
import { useTheme } from "./ThemeContext";
import { useToast } from "./ToastContext";
import { BranchExplorer } from "./BranchExplorer";
import { CommitMiniLog } from "./CommitMiniLog";
import { StashList } from "./StashList";
import { HotFiles } from "./HotFiles";
import { CommitHistory } from "./CommitHistory";
import { Contributors } from "./Contributors";
import { StashGallery } from "./StashGallery";
import { CommitGraph } from "./CommitGraph"; // Import CommitGraph
import { CommitDetails } from "./CommitDetails"; // Import CommitDetails
import { BranchCheckout } from "./BranchCheckout";

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
  const [stashes, setStashes] = useState<string[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [currentView, setCurrentView] = useState<
    "graph" | "insights" | "history" | "contributors" | "stashes" | "checkout"
  >("graph");

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

    const fetchStashes = async () => {
      try {
        const fetchedStashes = await window.gitnetAPI.getStashList(
          repository.path,
        );
        setStashes(fetchedStashes);
      } catch (error) {
        console.error("Failed to fetch stashes:", error);
      }
    };

    fetchBranches();
    fetchCommits();
    fetchStashes();

    const handleBranchesUpdated = () => {
      fetchBranches(); // Re-fetch branches when updated
    };

    const handleCommitsUpdated = () => {
      fetchCommits(); // Re-fetch commits when updated
    };

    let unsubscribeBranches: (() => void) | undefined;
    let unsubscribeCommits: (() => void) | undefined;

    if (window.gitnetAPI) {
      unsubscribeBranches = window.gitnetAPI.onBranchesUpdated(
        handleBranchesUpdated,
      );
      unsubscribeCommits =
        window.gitnetAPI.onCommitsUpdated(handleCommitsUpdated);
    }

    return () => {
      unsubscribeBranches?.();
      unsubscribeCommits?.();
    };
  }, [repository.path, showToast]);

  const handleBranchSelect = async (branchName: string) => {
    if (branchName === repository.currentBranch) return;

    if (window.gitnetAPI && typeof window.gitnetAPI.checkoutBranch === 'function') {
      try {
        showToast(`Checking out ${branchName}...`, "info");
        await window.gitnetAPI.checkoutBranch(repository.path, branchName);
        showToast(`Checked out ${branchName}`, "success");
        
        // Refresh local state (this will also be triggered by the watcher)
        const fetchedBranches = await window.gitnetAPI.getBranches(repository.path);
        setBranches(fetchedBranches);
      } catch (error) {
        console.error("Checkout failed:", error);
        showToast(`Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
      }
    } else {
      showToast("Checkout feature is currently unavailable.", "info");
    }
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

  const renderMainContent = () => {
    switch (currentView) {
      case "graph":
        return (
          <CommitGraph
            commits={commits}
            branches={branches}
            stashes={stashes}
            headCommitHash={repository.headCommit}
            selectedCommitHash={selectedCommit?.hash}
            onCommitSelect={handleCommitSelect}
          />
        );
      case "history":
        return (
          <CommitHistory
            commits={commits}
            branches={branches}
            headCommitHash={repository.headCommit}
            onCommitSelect={handleCommitSelect}
            selectedCommitHash={selectedCommit?.hash}
          />
        );
      case "contributors":
        return (
          <div className="max-w-none w-full h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 scrollbar-hide bg-zed-surface dark:bg-zed-dark-surface">
            <div className="p-12 max-w-6xl mx-auto">
              <div className="mb-10">
                <h1 className="text-2xl font-bold text-zed-text dark:text-zed-dark-text tracking-tight">
                  Team Insights
                </h1>
                <p className="text-sm text-zed-muted dark:text-zed-dark-muted opacity-70">
                  Analysis of contributor activity, development impact, and
                  chronological engagement.
                </p>
              </div>
              <Contributors repoPath={repository.path} />
            </div>
          </div>
        );
      case "insights":
        return (
          <div className="max-w-none w-full h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 scrollbar-hide bg-zed-surface dark:bg-zed-dark-surface">
            <div className="p-12 max-w-5xl mx-auto">
              <div className="mb-10">
                <h1 className="text-2xl font-bold text-zed-text dark:text-zed-dark-text tracking-tight">
                  Repository Insights
                </h1>
                <p className="text-sm text-zed-muted dark:text-zed-dark-muted opacity-70">
                  Analysis of file modification frequency and repository hotspots.
                </p>
              </div>
              <div className="bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border relative overflow-hidden shadow-sm">
                <div className="p-1 border-b border-zed-border dark:border-zed-dark-border bg-zed-element/30 dark:bg-zed-dark-element/30 flex items-center justify-between px-4 py-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted">
                    Hotspots / Top Modified
                  </h2>
                </div>
                <HotFiles repoPath={repository.path} />
              </div>
            </div>
          </div>
        );
      case "stashes":
        return <StashGallery repoPath={repository.path} />;
      case "checkout":
        return (
          <div className="max-w-none w-full h-full overflow-y-auto animate-in fade-in slide-in-from-bottom-4 scrollbar-hide bg-zed-surface dark:bg-zed-dark-surface">
            <div className="p-12 max-w-4xl mx-auto">
              <BranchCheckout
                branches={branches}
                currentBranchName={repository.currentBranch}
                onBranchSelect={handleBranchSelect}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
                <div className="px-3 py-2 text-[10px] font-bold text-zed-muted dark:text-zed-dark-muted uppercase tracking-[0.1em] flex items-center justify-between group opacity-50">
                  <span>Branches</span>
                </div>
                <BranchExplorer
                  branches={branches}
                  currentBranchName={repository.currentBranch}
                />
              </div>

              <div className="space-y-1">
                <div className="px-3 py-2 text-[10px] font-bold text-zed-muted dark:text-zed-dark-muted uppercase tracking-[0.1em] flex items-center justify-between group opacity-50">
                  <span>Recent</span>
                </div>
                <CommitMiniLog
                  repoPath={repository.path}
                  onCommitSelect={handleCommitSelect}
                />
              </div>
            </div>
          </div>
        )}

        {/* Editor Area (Graph or Insights) */}
        <div className="flex-1 flex flex-col bg-zed-bg dark:bg-zed-dark-bg relative">
          {/* Canvas Area */}
          <div className="flex-1 overflow-hidden relative group">
            {renderMainContent()}
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
              <CommitDetails
                commit={selectedCommit}
                repoPath={repository.path}
                onSelectCommit={(hashToSelect) => {
                  const commitToSelect = commits.find(
                    (c) => c.hash === hashToSelect,
                  );
                  if (commitToSelect) {
                    setSelectedCommit(commitToSelect);
                  } else {
                    setSelectedCommit({ hash: hashToSelect } as Commit);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-8 flex items-center justify-between px-3 bg-zed-surface dark:bg-zed-dark-surface border-t border-zed-border dark:border-zed-dark-border text-[11px] text-zed-text dark:text-zed-dark-text select-none py-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentView("graph")}
              className={`p-1.5 rounded-none transition-all duration-200 ${currentView === "graph" ? "bg-zed-element dark:bg-zed-dark-element text-zed-text dark:text-zed-dark-text shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-zed-muted/50 dark:text-zed-dark-muted/50 hover:text-zed-text dark:hover:text-zed-dark-text hover:bg-zed-element/50 dark:hover:bg-zed-dark-element/50"}`}
              title="Graph View"
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
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentView("history")}
              className={`p-1.5 rounded-none transition-all duration-200 ${currentView === "history" ? "bg-zed-element dark:bg-zed-dark-element text-zed-text dark:text-zed-dark-text shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-zed-muted/50 dark:text-zed-dark-muted/50 hover:text-zed-text dark:hover:text-zed-dark-text hover:bg-zed-element/50 dark:hover:bg-zed-dark-element/50"}`}
              title="Commit History"
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentView("insights")}
              className={`p-1.5 rounded-none transition-all duration-200 ${currentView === "insights" ? "bg-zed-element dark:bg-zed-dark-element text-zed-text dark:text-zed-dark-text shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-zed-muted/50 dark:text-zed-dark-muted/50 hover:text-zed-text dark:hover:text-zed-dark-text hover:bg-zed-element/50 dark:hover:bg-zed-dark-element/50"}`}
              title="Insights View"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentView("contributors")}
              className={`p-1.5 rounded-none transition-all duration-200 ${currentView === "contributors" ? "bg-zed-element dark:bg-zed-dark-element text-zed-text dark:text-zed-dark-text shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-zed-muted/50 dark:text-zed-dark-muted/50 hover:text-zed-text dark:hover:text-zed-dark-text hover:bg-zed-element/50 dark:hover:bg-zed-dark-element/50"}`}
              title="Contributors"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentView("stashes")}
              className={`p-1.5 rounded-none transition-all duration-200 ${currentView === "stashes" ? "bg-zed-element dark:bg-zed-dark-element text-zed-text dark:text-zed-dark-text shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-zed-muted/50 dark:text-zed-dark-muted/50 hover:text-zed-text dark:hover:text-zed-dark-text hover:bg-zed-element/50 dark:hover:bg-zed-dark-element/50"}`}
              title="Stash Gallery"
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentView("checkout")}
              className={`p-1.5 rounded-none transition-all duration-200 ${currentView === "checkout" ? "bg-zed-element dark:bg-zed-dark-element text-zed-text dark:text-zed-dark-text shadow-sm ring-1 ring-black/5 dark:ring-white/10" : "text-zed-muted/50 dark:text-zed-dark-muted/50 hover:text-zed-text dark:hover:text-zed-dark-text hover:bg-zed-element/50 dark:hover:bg-zed-dark-element/50"}`}
              title="Checkout Branch"
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </button>
          </div>

          <div className="w-px h-3 bg-zed-border dark:bg-zed-dark-border mx-1"></div>

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
