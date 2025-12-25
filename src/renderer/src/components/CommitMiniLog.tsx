import React, { useState, useEffect } from 'react';
import { Commit } from '@shared/types';
import { useToast } from './ToastContext'; // Assuming ToastContext is available

interface CommitMiniLogProps {
  repoPath: string;
}

export const CommitMiniLog: React.FC<CommitMiniLogProps> = ({ repoPath }) => {
  const { showToast } = useToast();
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentCommits = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedCommits = await window.gitnetAPI.getRecentCommits(repoPath);
        setCommits(fetchedCommits);
      } catch (err) {
        console.error("Failed to fetch recent commits:", err);
        setError("Failed to load recent commits.");
        showToast("Failed to load recent commits.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCommits();

    // Optionally, refresh commits when the repository changes or on a timer
    // For now, we'll rely on explicit refresh or parent component's re-render
    // when repoPath changes.
    const handleCommitsUpdated = () => {
        fetchRecentCommits();
    };

    if (window.gitnetAPI) {
        window.gitnetAPI.onCommitsUpdated(handleCommitsUpdated);
    }

    return () => {
        // Cleanup listener if API provides an unsubscribe
    };
  }, [repoPath, showToast]);

  const getAuthorInitials = (authorName: string) => {
    return authorName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="text-zed-muted dark:text-zed-dark-muted text-xs px-3 py-2">
        Loading commits...
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
      {commits.map((commit) => (
        <div
          key={commit.hash}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zed-element dark:hover:bg-zed-dark-element cursor-pointer"
          title={`${commit.author.name} - ${commit.shortMessage}`}
        >
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zed-surface-2 dark:bg-zed-dark-surface-2 flex items-center justify-center text-xs text-zed-muted dark:text-zed-dark-muted">
            {getAuthorInitials(commit.author.name)}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm truncate text-zed-text dark:text-zed-dark-text">
              {commit.shortMessage}
            </div>
            <div className="text-xs text-zed-muted dark:text-zed-dark-muted truncate opacity-70">
              {commit.author.name} - {new Date(commit.timestamp * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
      {commits.length === 0 && (
        <div className="text-zed-muted dark:text-zed-dark-muted text-xs px-3 py-2">
          No recent commits.
        </div>
      )}
    </div>
  );
};
