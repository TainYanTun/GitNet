import React from "react";
import { Repository } from "@shared/types";
import { useTheme } from "./ThemeContext";

interface MainLayoutProps {
  repository: Repository;
  onCloseRepository: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  repository,
  onCloseRepository,
}) => {
  const { toggleTheme } = useTheme();

  return (
    <div className="h-full w-full flex flex-col bg-zed-bg dark:bg-zed-dark-bg text-zed-text dark:text-zed-dark-text overflow-hidden">
      {/* Title Bar / Toolbar */}
      <div className="h-10 flex items-center justify-between px-4 bg-zed-bg dark:bg-zed-dark-bg border-b border-zed-border dark:border-zed-dark-border select-none shrink-0 draggable">
        <div className="flex items-center gap-3">
          {/* Window Controls Placeholder (Mac) */}
          <div className="w-14 no-drag"></div>
          <span className="text-xs font-medium text-zed-muted uppercase tracking-wider">
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
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Project Explorer Style) */}
        <div className="w-60 flex-shrink-0 flex flex-col border-r border-zed-border dark:border-zed-dark-border bg-zed-surface dark:bg-zed-dark-surface">
          <div className="px-3 py-2 text-xs font-bold text-zed-muted dark:text-zed-dark-muted uppercase tracking-wider flex items-center justify-between group">
            <span>Project Info</span>
            <button
              onClick={onCloseRepository}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zed-element dark:hover:bg-zed-dark-element rounded text-zed-text dark:text-zed-dark-text"
              title="Close Repository"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
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
              <div className="text-[11px] text-zed-muted dark:text-zed-dark-muted uppercase">
                Stats
              </div>
              <div className="text-sm text-zed-text dark:text-zed-dark-text">
                {repository.branches.length} local branches
              </div>
            </div>
          </div>
        </div>

        {/* Editor Area (Graph) */}
        <div className="flex-1 flex flex-col bg-zed-bg dark:bg-zed-dark-bg relative">
          {/* Canvas Area */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center text-zed-muted dark:text-zed-dark-muted">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-zed-element dark:text-zed-dark-element flex items-center justify-center">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="font-medium">Waiting for D3 Graph...</p>
              </div>
            </div>
          </div>
        </div>
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
