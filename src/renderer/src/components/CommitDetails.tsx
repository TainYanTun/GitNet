import React, { useState, useEffect } from "react";
import { Commit, FileChange } from "@shared/types";
import moment from "moment";
import { DiffModal } from "./DiffModal";
import { FileTree } from "./FileTree";

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="opacity-50 group-hover:opacity-100 transition-opacity"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

interface CommitDetailsProps {
  commit: Commit;
  repoPath: string;
  onSelectCommit: (hash: string) => void;
}

export const CommitDetails: React.FC<CommitDetailsProps> = ({
  commit,
  repoPath,
  onSelectCommit,
}) => {
  const [fullCommitDetails, setFullCommitDetails] = useState<Commit | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileChange | null>(null);
  const [diffContent, setDiffContent] = useState<string | null>(null);
  const [isDiffModalVisible, setDiffModalVisible] = useState(false);

  const handleCopy = async (text: string, hash: string) => {
    try {
      await window.gitcanopyAPI.copyToClipboard(text);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 1500); // Show "Copied!" for 1.5 seconds
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleFileClick = async (file: FileChange) => {
    setSelectedFile(file);
    setDiffContent("Loading diff...");
    setDiffModalVisible(true);
    try {
      const diff = await window.gitcanopyAPI.getDiff(
        repoPath,
        commit.hash,
        file.path,
      );
      setDiffContent(diff);
    } catch (error) {
      setDiffContent("Failed to load diff.");
    }
  };

  useEffect(() => {
    const fetchFullDetails = async () => {
      setLoading(true);
      setError(null);
      setFullCommitDetails(null); // Clear previous details
      try {
        const details = await window.gitcanopyAPI.getCommitDetails(
          repoPath,
          commit.hash,
        );
        setFullCommitDetails(details);
      } catch (err) {
        console.error("Failed to fetch full commit details:", err);
        setError("Failed to load full commit details.");
      } finally {
        setLoading(false);
      }
    };

    if (commit?.hash && repoPath) {
      // Ensure repoPath is available
      fetchFullDetails();
    }
  }, [commit?.hash, repoPath]); // Re-fetch when commit hash or repoPath changes

  const getAuthorInitials = (authorName: string) => {
    return authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (!commit || !fullCommitDetails || loading) {
    return (
      <div className="p-4 text-zed-muted dark:text-zed-dark-muted">
        {loading
          ? "Loading commit details..."
          : "Select a commit to see details."}
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </div>
    );
  }

  const displayCommit = fullCommitDetails || commit; // Use full details if available, otherwise basic commit
  const formattedDate = moment
    .unix(displayCommit.timestamp)
    .format("MMM D, YYYY h:mm A");

  return (
    <div className="p-4 space-y-4 text-zed-text dark:text-zed-dark-text text-sm">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zed-element dark:bg-zed-dark-element border border-zed-border dark:border-zed-dark-border flex items-center justify-center overflow-hidden shadow-sm">
          {displayCommit.author.avatarUrl ? (
            <img
              src={displayCommit.author.avatarUrl}
              alt={displayCommit.author.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-zed-muted dark:text-zed-dark-muted font-bold">
              {getAuthorInitials(displayCommit.author.name)}
            </span>
          )}
        </div>
        <div>
          <div className="font-semibold">{displayCommit.author.name}</div>
          <div className="text-xs text-zed-muted dark:text-zed-dark-muted">
            {displayCommit.author.email}
          </div>

          {/* Stats Summary Under Profile */}
          {displayCommit.stats && (
            <div className="flex items-center gap-3 mt-1.5 opacity-80">
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span className="text-green-500 font-bold">+</span>
                <span className="text-zed-text dark:text-zed-dark-text">
                  {displayCommit.stats.additions}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span className="text-red-500 font-bold">-</span>
                <span className="text-zed-text dark:text-zed-dark-text">
                  {displayCommit.stats.deletions}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] ml-1">
                <span className="text-zed-muted opacity-60 uppercase">
                  Files:
                </span>
                <span className="text-zed-text dark:text-zed-dark-text">
                  {displayCommit.fileChanges?.length || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase">
          Message
        </div>
        <div className="font-medium">{displayCommit.shortMessage}</div>
        {displayCommit.message !== displayCommit.shortMessage && (
          <pre className="text-xs text-zed-muted dark:text-zed-dark-muted whitespace-pre-wrap font-mono mt-1">
            {displayCommit.message
              .substring(displayCommit.shortMessage.length)
              .trim()}
          </pre>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase">
          Hash
        </div>
        <div
          className="font-mono text-zed-text dark:text-zed-dark-text text-xs truncate flex-grow min-w-0 cursor-pointer hover:bg-zed-element dark:hover:bg-zed-dark-element p-1 rounded inline-flex items-center group"
          onClick={() => handleCopy(displayCommit.hash, displayCommit.hash)}
          title="Click to copy full hash"
        >
          {copiedHash === displayCommit.hash ? (
            <span className="text-green-500 text-xs mr-1">Copied!</span>
          ) : (
            <>
              <span className="mr-1">{displayCommit.shortHash}</span>
              <CopyIcon />
            </>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase">
          Parents
        </div>
        <div className="space-y-1">
          {" "}
          {/* Added a div for spacing between parent entries */}
          {displayCommit.parentsDetails &&
          displayCommit.parentsDetails.length > 0 ? (
            displayCommit.parentsDetails.map((p) => (
              <div
                key={p.hash}
                className="flex flex-col p-1 rounded hover:bg-zed-element dark:hover:bg-zed-dark-element cursor-pointer"
                onClick={() => onSelectCommit(p.hash)}
              >
                <div
                  className="font-mono text-zed-text dark:text-zed-dark-text truncate flex-grow min-w-0 cursor-pointer hover:bg-zed-element dark:hover:bg-zed-dark-element p-1 rounded inline-flex items-center group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(p.hash, p.hash);
                  }}
                  title="Click to copy full hash"
                >
                  {copiedHash === p.hash ? (
                    <span className="text-green-500 text-xs mr-1">Copied!</span>
                  ) : (
                    <>
                      <span className="mr-1">{p.shortHash}</span>
                      <CopyIcon />
                    </>
                  )}
                </div>
                {p.author?.name && (
                  <div className="text-xs text-zed-muted dark:text-zed-dark-muted ml-3">
                    By {p.author.name}
                  </div>
                )}
                {p.shortMessage && (
                  <div className="text-xs text-zed-muted dark:text-zed-dark-muted ml-3 truncate">
                    {p.shortMessage}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="font-mono text-zed-text dark:text-zed-dark-text text-xs">
              (root-commit)
            </div>
          )}
        </div>
      </div>

      {displayCommit.branches && displayCommit.branches.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase flex items-center justify-between">
            <span>Branches</span>
            <span className="text-[10px] opacity-50 lowercase italic">
              {displayCommit.branches.length} containing
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {displayCommit.branches.map((branch) => {
              const isTip = displayCommit.branchTips?.includes(branch);
              const isInferred = commit.branchName === branch;
              
              return (
                <span
                  key={branch}
                  className={`px-2 py-0.5 text-[11px] rounded-full border transition-all ${
                    isTip 
                      ? "bg-zed-accent/10 border-zed-accent text-zed-accent font-bold" 
                      : isInferred
                        ? "bg-zed-element dark:bg-zed-dark-element border-zed-muted dark:border-zed-dark-border text-zed-text dark:text-zed-dark-text font-medium shadow-sm"
                        : "bg-zed-element dark:bg-zed-dark-element border-transparent text-zed-muted dark:text-zed-dark-text opacity-90"
                  }`}
                  title={isTip ? "Branch Tip" : isInferred ? "Inferred Original Branch" : "Contains Commit"}
                >
                  {isTip && <span className="mr-1">●</span>}
                  {branch}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {displayCommit.tags && displayCommit.tags.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase">
            Tags
          </div>
          <div className="flex flex-wrap gap-1">
            {displayCommit.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-zed-element dark:bg-zed-dark-element rounded-full text-zed-text dark:text-zed-dark-text"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

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
        <div
          className={`text-xs px-2 py-0.5 rounded-full inline-block ${
            displayCommit.type === "feat"
              ? "bg-commit-feat text-white"
              : displayCommit.type === "fix"
                ? "bg-commit-fix text-white"
                : displayCommit.type === "docs"
                  ? "bg-commit-docs text-white"
                  : displayCommit.type === "style"
                    ? "bg-commit-style text-white"
                    : displayCommit.type === "refactor"
                      ? "bg-commit-refactor text-white"
                      : displayCommit.type === "perf"
                        ? "bg-commit-perf text-white"
                        : displayCommit.type === "test"
                          ? "bg-commit-test text-white"
                          : displayCommit.type === "chore"
                            ? "bg-commit-chore text-white"
                            : "bg-commit-other text-white"
          }`}
        >
          {displayCommit.type}
        </div>
      </div>

      {displayCommit.fileChanges && displayCommit.fileChanges.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-zed-muted dark:text-zed-dark-muted uppercase px-1">
            File Changes ({displayCommit.fileChanges.length})
          </div>
          <div className="border border-zed-border dark:border-zed-dark-border rounded bg-zed-bg/30 dark:bg-zed-dark-bg/30 overflow-hidden">
            <FileTree
              files={displayCommit.fileChanges}
              onFileClick={handleFileClick}
            />
          </div>
        </div>
      )}
      {selectedFile && (
        <DiffModal
          visible={isDiffModalVisible}
          onClose={() => setDiffModalVisible(false)}
          filePath={selectedFile.path}
          diffContent={diffContent || ""}
        />
      )}
    </div>
  );
};
