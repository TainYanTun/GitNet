import React, { useState, useMemo } from "react";
import { Commit, Branch } from "@shared/types";
import moment from "moment";

interface CommitHistoryProps {
  commits: Commit[];
  branches: Branch[];
  headCommitHash?: string;
  onCommitSelect: (commit: Commit) => void;
  selectedCommitHash?: string;
  fileFilter?: string | null;
  onClearFilter?: () => void;
}

export const CommitHistory: React.FC<CommitHistoryProps> = ({
  commits,
  branches,
  headCommitHash,
  onCommitSelect,
  selectedCommitHash,
  fileFilter,
  onClearFilter,
}) => {
  const [search, setSearch] = useState("");

  const filteredCommits = useMemo(() => {
    if (!search.trim()) return commits;
    const query = search.toLowerCase();
    return commits.filter(
      (c) =>
        c.message.toLowerCase().includes(query) ||
        c.author.name.toLowerCase().includes(query) ||
        c.hash.toLowerCase().includes(query),
    );
  }, [commits, search]);

  const typeInitialMap: Record<string, string> = {
    feat: "F",
    fix: "X",
    docs: "D",
    style: "S",
    refactor: "R",
    perf: "P",
    test: "T",
    chore: "C",
    revert: "V",
  };

  const typeColorMap: Record<string, string> = {
    feat: "text-commit-feat",
    fix: "text-commit-fix",
    docs: "text-commit-docs",
    style: "text-commit-style",
    refactor: "text-commit-refactor",
    perf: "text-commit-perf",
    test: "text-commit-test",
    chore: "text-commit-chore",
    revert: "text-commit-other",
  };

  return (
    <div className="flex flex-col h-full bg-zed-surface dark:bg-zed-dark-surface animate-in fade-in slide-in-from-bottom-4">
      {/* Header Area */}
      <div className="p-8 pb-4 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zed-text dark:text-zed-dark-text tracking-tight">
            Commit History
          </h1>
          <p className="text-sm text-zed-muted dark:text-zed-dark-muted opacity-70">
            Chronological log of repository changes and contributions.
          </p>
        </div>

        {fileFilter && (
          <div className="mb-6 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[10px] uppercase font-bold text-zed-muted opacity-50 tracking-wider">File Filter:</span>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zed-accent/10 border border-zed-accent/30 rounded-none text-xs text-zed-accent font-mono shadow-sm group">
              <span className="truncate max-w-md">{fileFilter}</span>
              <button 
                onClick={onClearFilter}
                className="ml-1 p-0.5 hover:bg-commit-fix hover:text-white rounded-full transition-all"
                title="Clear Filter"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="relative group max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zed-muted/40 group-focus-within:text-zed-accent transition-colors">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Filter commits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border rounded-none pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-zed-accent transition-all font-mono placeholder:text-zed-muted/30 text-zed-text dark:text-zed-dark-text shadow-sm"
          />
        </div>
      </div>

      {/* Commit List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 max-w-5xl mx-auto w-full">
        <div className="bg-zed-bg dark:bg-zed-dark-surface  border border-zed-border dark:border-zed-dark-border overflow-hidden table-fixed w-full shadow-sm">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-zed-element dark:bg-zed-dark-element border-b border-zed-border dark:border-zed-dark-border">
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted w-14 text-center">
                  Type
                </th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted">
                  Message
                </th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted w-32">
                  Author
                </th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted w-24">
                  Date
                </th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted w-24 text-right">
                  Hash
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zed-border/30 dark:divide-zed-dark-border/30">
              {filteredCommits.map((commit) => (
                <tr
                  key={commit.hash}
                  onClick={() => onCommitSelect(commit)}
                  className={`hover:bg-zed-element/50 dark:hover:bg-zed-dark-element/50 cursor-pointer transition-colors group ${
                    selectedCommitHash === commit.hash
                      ? "bg-zed-element dark:bg-zed-dark-element"
                      : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div
                      className={`w-6 h-6 flex items-center justify-center text-[10px] font-black border border-current rounded-none mx-auto ${typeColorMap[commit.type] || "text-zed-muted"}`}
                    >
                      {typeInitialMap[commit.type] || "O"}
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-sm font-medium text-zed-text dark:text-zed-dark-text truncate">
                        {commit.shortMessage}
                      </span>
                      {commit.tags?.slice(0, 1).map((tag) => (
                        <span
                          key={tag}
                          className="px-1 py-0 text-[9px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20 uppercase font-bold tracking-tight shrink-0"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate text-xs text-zed-text dark:text-zed-dark-text opacity-80 font-mono">
                    {commit.author.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[11px] text-zed-muted dark:text-zed-dark-muted font-mono opacity-60">
                    {moment.unix(commit.timestamp).format("MMM D, YY")}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[10px] text-zed-muted/50 group-hover:text-zed-accent transition-colors">
                    {commit.shortHash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCommits.length === 0 && (
            <div className="p-12 text-center text-zed-muted italic font-mono text-sm opacity-50 bg-zed-bg dark:bg-zed-dark-bg">
              No commits match your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
