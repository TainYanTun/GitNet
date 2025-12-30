import React, { useState, useMemo, useCallback } from "react";
import { Commit, Branch, CommitFilterOptions } from "@shared/types";
import moment from "moment";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";

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

  const Row = useCallback(({ index, style, ariaAttributes }: { index: number; style: React.CSSProperties; ariaAttributes: { "aria-posinset": number; "aria-setsize": number; role: "listitem"; } }): React.ReactElement => {
    const commit = commits[index];
    if (!commit) return <div style={style} />;

    const isSelected = selectedCommitHash === commit.hash;

    return (
      <div
        style={style}
        {...ariaAttributes}
        onClick={() => onCommitSelect(commit)}
        className={`flex items-center hover:bg-zed-element/50 dark:hover:bg-zed-dark-element/50 cursor-pointer transition-colors group border-b border-zed-border/10 dark:border-zed-dark-border/10 ${
          isSelected ? "bg-zed-element dark:bg-zed-dark-element" : ""
        }`}
      >
        <div className="w-14 shrink-0 flex items-center justify-center">
          <div
            className={`w-6 h-6 flex items-center justify-center text-[10px] font-black border border-current rounded-none ${
              typeColorMap[commit.type] || "text-zed-muted"
            }`}
          >
            {typeInitialMap[commit.type] || "O"}
          </div>
        </div>
        <div className="flex-1 min-w-0 px-4 flex items-center gap-2 overflow-hidden">
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
        <div className="w-32 shrink-0 px-4 truncate text-xs text-zed-text dark:text-zed-dark-text opacity-80 font-mono">
          {commit.author.name}
        </div>
        <div className="w-24 shrink-0 px-4 whitespace-nowrap text-[11px] text-zed-muted dark:text-zed-dark-muted font-mono opacity-60">
          {moment.unix(commit.timestamp).format("MMM D, YY")}
        </div>
        <div className="w-24 shrink-0 px-4 text-right font-mono text-[10px] text-zed-muted/50 group-hover:text-zed-accent transition-colors">
          {commit.shortHash}
        </div>
      </div>
    );
  }, [commits, selectedCommitHash, onCommitSelect]);


  return (
    <div className="flex flex-col h-full bg-zed-surface dark:bg-zed-dark-surface animate-in fade-in slide-in-from-bottom-4">
      {/* Header Area */}
      <div className="p-8 pb-4 max-w-5xl mx-auto w-full shrink-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zed-text dark:text-zed-dark-text tracking-tight">
            Commit History
          </h1>
          <p className="text-sm text-zed-muted dark:text-zed-dark-muted opacity-70">
            Chronological log of repository changes and contributions.
          </p>
        </div>

        {/* Active Filters Display */}
        {Object.values(filters).some((v) => !!v) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[10px] uppercase font-bold text-zed-muted opacity-50 tracking-wider">
              Active Filters:
            </span>
            {filters.query && (
              <FilterBadge label="Search" value={filters.query} onClear={() => setSearch("")} />
            )}
            {filters.path && (
              <FilterBadge
                label="File"
                value={filters.path}
                onClear={() => onFilterChange({ ...filters, path: undefined })}
              />
            )}
            {filters.author && (
              <FilterBadge
                label="Author"
                value={filters.author}
                onClear={() => onFilterChange({ ...filters, author: undefined })}
              />
            )}
            {filters.since && (
              <FilterBadge
                label="Since"
                value={filters.since}
                onClear={() => onFilterChange({ ...filters, since: undefined })}
              />
            )}
            {filters.until && (
              <FilterBadge
                label="Until"
                value={filters.until}
                onClear={() => onFilterChange({ ...filters, until: undefined })}
              />
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
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border transition-all ${
              showAdvanced
                ? "bg-zed-accent border-zed-accent text-white"
                : "bg-zed-bg dark:bg-zed-dark-bg border-zed-border dark:border-zed-dark-border text-zed-muted hover:text-zed-text"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {showAdvanced ? "Hide Filters" : "Advanced Filters"}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 mb-8 bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border animate-in slide-in-from-top-2 duration-200 shadow-xl">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zed-muted">
                Author
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={filters.author || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, author: e.target.value || undefined })
                }
                className="w-full bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border p-2 text-xs font-mono focus:outline-none focus:border-zed-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zed-muted">
                Since Date
              </label>
              <input
                type="date"
                value={filters.since || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, since: e.target.value || undefined })
                }
                className="w-full bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border p-2 text-xs font-mono focus:outline-none focus:border-zed-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zed-muted">
                Until Date
              </label>
              <input
                type="date"
                value={filters.until || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, until: e.target.value || undefined })
                }
                className="w-full bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border p-2 text-xs font-mono focus:outline-none focus:border-zed-accent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Commit List Area */}
      <div className="flex-1 px-8 pb-8 max-w-5xl mx-auto w-full overflow-hidden flex flex-col">
        <div className="bg-zed-bg dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border shadow-sm flex flex-col flex-1 overflow-hidden">
          {/* Table Header */}
          <div className="flex bg-zed-element dark:bg-zed-dark-element border-b border-zed-border dark:border-zed-dark-border shrink-0">
            <div className="w-14 shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted text-center">
              Type
            </div>
            <div className="flex-1 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted">
              Message
            </div>
            <div className="w-32 shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted">
              Author
            </div>
            <div className="w-24 shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted">
              Date
            </div>
            <div className="w-24 shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zed-muted dark:text-zed-dark-muted text-right">
              Hash
            </div>
          </div>

          {/* Virtualized List */}
          <div className="flex-1 min-h-0">
            <AutoSizer
              Child={({ height, width }) => (
                <List
                  style={{ height: height || 0, width: width || 0 }}
                  rowCount={commits.length}
                  rowHeight={48}
                  onRowsRendered={({ stopIndex }) => {
                    if (hasMore && onLoadMore && stopIndex >= commits.length - 5) {
                      onLoadMore();
                    }
                  }}
                  rowComponent={Row}
                  rowProps={{}}
                  className="custom-scrollbar"
                />
              )}
            />
            {commits.length === 0 && (
              <div className="p-12 text-center text-zed-muted italic font-mono text-sm opacity-50 bg-zed-bg dark:bg-zed-dark-bg h-full flex items-center justify-center">
                No commits match your criteria.
              </div>
            )}
          </div>
        </div>
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