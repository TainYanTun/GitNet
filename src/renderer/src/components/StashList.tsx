import React, { useState, useEffect } from 'react';
import { StashEntry } from '@shared/types';
import { useToast } from './ToastContext'; // Assuming ToastContext is available

interface StashListProps {
  repoPath: string;
}

export const StashList: React.FC<StashListProps> = ({ repoPath }) => {
  const { showToast } = useToast();
  const [stashEntries, setStashEntries] = useState<StashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStashList = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedStashEntries = await window.gitnetAPI.getStashList(repoPath);
        setStashEntries(fetchedStashEntries);
      } catch (err) {
        console.error("Failed to fetch stash list:", err);
        setError("Failed to load stash list.");
        showToast("Failed to load stash list.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStashList();

    // Optionally, refresh stash list when the repository changes or on a timer
    // For now, we'll rely on explicit refresh or parent component's re-render
    // when repoPath changes.
    // Consider adding a watcher for .git/refs/stash
    // window.gitnetAPI.onStashUpdated(fetchStashList);

    return () => {
      // Cleanup listener if API provides an unsubscribe
    };
  }, [repoPath, showToast]);

  if (loading) {
    return (
      <div className="text-zed-muted dark:text-zed-dark-muted text-xs px-3 py-2">
        Loading stash...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-xs px-3 py-2">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {stashEntries.length === 0 ? (
        <div className="text-zed-muted dark:text-zed-dark-muted text-xs px-3 py-2">
          No stashed changes.
        </div>
      ) : (
        stashEntries.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zed-element dark:hover:bg-zed-dark-element cursor-pointer"
            title={entry}
          >
            <svg
              className="w-3 h-3 flex-shrink-0 text-zed-muted dark:text-zed-dark-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <span className="text-sm truncate text-zed-text dark:text-zed-dark-text">
              {entry.split(':').slice(1).join(':').trim()}
            </span>
            <span className="ml-auto text-xs font-mono opacity-70 text-zed-muted dark:text-zed-dark-muted">
              {entry.split(':')[0].trim()}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
