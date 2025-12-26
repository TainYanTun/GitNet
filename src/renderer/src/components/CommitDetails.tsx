import React from "react";
import { Commit } from "@shared/types";
import moment from "moment"; // For date formatting

interface CommitDetailsProps {
  commit: Commit;
}

export const CommitDetails: React.FC<CommitDetailsProps> = ({ commit }) => {
  const getAuthorInitials = (authorName: string) => {
    return authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!commit) {
    return (
      <div className="p-4 text-zed-muted dark:text-zed-dark-muted">
        Select a commit to see details.
      </div>
    );
  }

  const formattedDate = moment.unix(commit.timestamp).format("MMM D, YYYY h:mm A");

  return (
    <div className="p-4 space-y-4 text-zed-text dark:text-zed-dark-text text-sm">
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zed-surface-2 dark:bg-zed-dark-surface-2 flex items-center justify-center text-xs text-zed-muted dark:text-zed-dark-muted font-medium">
          {getAuthorInitials(commit.author.name)}
        </div>
        <div>
          <div className="font-semibold">{commit.author.name}</div>
          <div className="text-xs text-zed-muted dark:text-zed-dark-muted">
            {commit.author.email}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase">
          Message
        </div>
        <div className="font-medium">{commit.shortMessage}</div>
        {commit.message !== commit.shortMessage && (
          <pre className="text-xs text-zed-muted dark:text-zed-dark-muted whitespace-pre-wrap font-mono mt-1">
            {commit.message.substring(commit.shortMessage.length).trim()}
          </pre>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase">
          Hash
        </div>
        <div className="font-mono text-zed-text dark:text-zed-dark-text text-xs">
          {commit.hash}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase">
          Parents
        </div>
        <div className="font-mono text-zed-text dark:text-zed-dark-text text-xs">
          {commit.parents.length > 0 ? (
            commit.parents.map((p) => (
              <div key={p}>{p}</div>
            ))
          ) : (
            <div>(root-commit)</div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase">
          Date
        </div>
        <div className="text-zed-text dark:text-zed-dark-text text-xs">
          {formattedDate}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase">
          Type
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
          commit.type === 'feat' ? 'bg-commit-feat text-white' :
          commit.type === 'fix' ? 'bg-commit-fix text-white' :
          commit.type === 'docs' ? 'bg-commit-docs text-white' :
          commit.type === 'style' ? 'bg-commit-style text-white' :
          commit.type === 'refactor' ? 'bg-commit-refactor text-white' :
          commit.type === 'perf' ? 'bg-commit-perf text-white' :
          commit.type === 'test' ? 'bg-commit-test text-white' :
          commit.type === 'chore' ? 'bg-commit-chore text-white' :
          'bg-commit-other text-white'
        }`}>
          {commit.type}
        </div>
      </div>
    </div>
  );
};