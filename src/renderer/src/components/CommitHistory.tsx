import React, { useState, useMemo } from "react";
import { Commit, Branch, CommitFilterOptions } from "@shared/types";
import moment from "moment";

interface CommitHistoryProps {
  commits: Commit[];
  branches: Branch[];
  headCommitHash?: string;
  onCommitSelect: (commit: Commit) => void;
  selectedCommitHash?: string;
  filters: CommitFilterOptions;
  onFilterChange: (filters: CommitFilterOptions) => void;
  onClearFilters: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const CommitHistory: React.FC<CommitHistoryProps> = ({
  commits,
  branches,
  headCommitHash,
  onCommitSelect,
  selectedCommitHash,
  filters,
  onFilterChange,
  onClearFilters,
  onLoadMore,
  hasMore,
}) => {
  const [search, setSearch] = useState(filters.query || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce search input to update filters
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (filters.query || "")) {
        onFilterChange({ ...filters, query: search || undefined });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, onFilterChange, filters]);

  // Sync internal search state if filters.query changes externally
  React.useEffect(() => {
    setSearch(filters.query || "");
  }, [filters.query]);

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

        {/* Active Filters Display */}
        {Object.values(filters).some(v => !!v) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[10px] uppercase font-bold text-zed-muted opacity-50 tracking-wider">Active Filters:</span>
            {filters.query && (
              <FilterBadge label="Search" value={filters.query} onClear={() => setSearch("")} />
            )}
            {filters.path && (
              <FilterBadge label="File" value={filters.path} onClear={() => onFilterChange({ ...filters, path: undefined })} />
            )}
            {filters.author && (
              <FilterBadge label="Author" value={filters.author} onClear={() => onFilterChange({ ...filters, author: undefined })} />
            )}
            {filters.since && (
              <FilterBadge label="Since" value={filters.since} onClear={() => onFilterChange({ ...filters, since: undefined })} />
            )}
            {filters.until && (
              <FilterBadge label="Until" value={filters.until} onClear={() => onFilterChange({ ...filters, until: undefined })} />
            )}
            <button 
              onClick={onClearFilters}
              className="text-[10px] uppercase font-bold text-commit-fix hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="relative group flex-1 max-w-sm">
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
              placeholder="Search history (greps message)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border rounded-none pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-zed-accent transition-all font-mono placeholder:text-zed-muted/30 text-zed-text dark:text-zed-dark-text shadow-sm"
            />
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border transition-all ${showAdvanced ? 'bg-zed-accent border-zed-accent text-white' : 'bg-zed-bg dark:bg-zed-dark-bg border-zed-border dark:border-zed-dark-border text-zed-muted hover:text-zed-text'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showAdvanced ? "Hide Filters" : "Advanced Filters"}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 mb-8 bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border animate-in slide-in-from-top-2 duration-200 shadow-xl">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zed-muted">Author</label>
              <input 
                type="text"
                placeholder="e.g. John Doe"
                value={filters.author || ""}
                onChange={(e) => onFilterChange({ ...filters, author: e.target.value || undefined })}
                className="w-full bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border p-2 text-xs font-mono focus:outline-none focus:border-zed-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zed-muted">Since Date</label>
              <input 
                type="date"
                value={filters.since || ""}
                onChange={(e) => onFilterChange({ ...filters, since: e.target.value || undefined })}
                className="w-full bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border p-2 text-xs font-mono focus:outline-none focus:border-zed-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zed-muted">Until Date</label>
              <input 
                type="date"
                value={filters.until || ""}
                onChange={(e) => onFilterChange({ ...filters, until: e.target.value || undefined })}
                className="w-full bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border p-2 text-xs font-mono focus:outline-none focus:border-zed-accent"
              />
            </div>
          </div>
        )}
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
              {commits.map((commit) => (
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
          {commits.length === 0 && (
            <div className="p-12 text-center text-zed-muted italic font-mono text-sm opacity-50 bg-zed-bg dark:bg-zed-dark-bg">
              No commits match your criteria.
            </div>
          )}
        </div>
        
        {/* Load More Button - Hyper Minimalist */}
        {hasMore && onLoadMore && !search && (
          <div className="py-8 flex justify-center bg-transparent">
            <button
              onClick={onLoadMore}
              className="group flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-zed-muted/60 dark:text-zed-dark-muted/60 hover:text-zed-accent dark:hover:text-zed-accent hover:bg-zed-accent/5 dark:hover:bg-zed-accent/10 transition-all duration-300"
            >
              <span>Load More Commits</span>
              <svg className="w-3 h-3 opacity-50 group-hover:translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface FilterBadgeProps {
  label: string;
  value: string;
  onClear: () => void;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({ label, value, onClear }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-zed-accent/10 border border-zed-accent/30 rounded-none text-xs text-zed-accent font-mono shadow-sm group">
    <span className="opacity-50 font-bold uppercase text-[9px]">{label}:</span>
    <span className="truncate max-w-[200px]">{value}</span>
    <button 
      onClick={onClear}
      className="ml-1 p-0.5 hover:bg-commit-fix hover:text-white rounded-full transition-all"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);
