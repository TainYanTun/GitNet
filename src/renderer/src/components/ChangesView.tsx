import React, { useState, useEffect } from "react";
import { WorkingTreeStatus, StatusFile } from "@shared/types";
import { FileTextOutlined, UndoOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { DiffModal } from "./DiffModal";

interface ChangesViewProps {
  repoPath: string;
}

export const ChangesView: React.FC<ChangesViewProps> = ({ repoPath }) => {
  const [status, setStatus] = useState<WorkingTreeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<StatusFile | null>(null);
  const [diffContent, setDiffContent] = useState<string>("");
  const [isDiffVisible, setIsDiffVisible] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await window.gitnetAPI.getStatus(repoPath);
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Refresh status when repository changes
    const unsubscribe = window.gitnetAPI.onRepositoryChanged(fetchStatus);
    return () => unsubscribe();
  }, [repoPath]);

  const handleFileClick = async (file: StatusFile) => {
    setSelectedFile(file);
    setIsDiffVisible(true);
    setDiffContent("Loading diff...");
    try {
      // For uncommitted changes, we compare against HEAD or index
      // Passing empty string as commit hash to signal working tree diff
      const diff = await window.gitnetAPI.getDiff(repoPath, "HEAD", file.path);
      setDiffContent(diff);
    } catch (err) {
      setDiffContent("Failed to load diff for uncommitted changes.");
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-full text-zed-muted animate-pulse font-mono text-xs uppercase tracking-widest">
        Scanning working tree...
      </div>
    );
  }

  const stagedFiles = status?.files.filter(f => f.staged) || [];
  const unstagedFiles = status?.files.filter(f => !f.staged) || [];

  return (
    <div className="h-full flex flex-col bg-zed-surface dark:bg-zed-dark-surface animate-in fade-in slide-in-from-bottom-4">
      <div className="p-8 pb-4 shrink-0 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-zed-text dark:text-zed-dark-text tracking-tight mb-2">
          Uncommitted Changes
        </h1>
        <p className="text-sm text-zed-muted dark:text-zed-dark-muted opacity-70 mb-6">
          Files modified in your working directory that are not yet committed.
        </p>

        {status && (status.ahead > 0 || status.behind > 0) && (
          <div className="mb-6 flex gap-4">
            {status.ahead > 0 && (
              <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-zed-accent/10 text-zed-accent border border-zed-accent/20">
                {status.ahead} Commits Ahead
              </div>
            )}
            {status.behind > 0 && (
              <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-commit-fix/10 text-commit-fix border border-commit-fix/20">
                {status.behind} Commits Behind
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 max-w-5xl mx-auto w-full space-y-8">
        {/* Staged Changes */}
        {stagedFiles.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 flex items-center gap-2">
              <PlusOutlined /> Staged Changes ({stagedFiles.length})
            </h2>
            <div className="bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border shadow-sm">
              {stagedFiles.map(file => (
                <FileRow key={file.path} file={file} onClick={() => handleFileClick(file)} />
              ))}
            </div>
          </section>
        )}

        {/* Unstaged Changes */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zed-muted flex items-center gap-2">
            <FileTextOutlined /> Working Directory ({unstagedFiles.length})
          </h2>
          {unstagedFiles.length > 0 ? (
            <div className="bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border shadow-sm">
              {unstagedFiles.map(file => (
                <FileRow key={file.path} file={file} onClick={() => handleFileClick(file)} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-zed-border dark:border-zed-dark-border opacity-30 italic text-sm">
              Your working tree is clean.
            </div>
          )}
        </section>
      </div>

      {selectedFile && (
        <DiffModal 
          visible={isDiffVisible}
          onClose={() => setIsDiffVisible(false)}
          filePath={selectedFile.path}
          diffContent={diffContent}
        />
      )}
    </div>
  );
};

const FileRow: React.FC<{ file: StatusFile; onClick: () => void }> = ({ file, onClick }) => {
  const statusColors = {
    added: "text-green-500",
    modified: "text-yellow-500",
    deleted: "text-red-500",
    renamed: "text-blue-500",
    untracked: "text-zed-muted",
    conflicted: "text-commit-fix animate-pulse"
  };

  return (
    <div 
      onClick={onClick}
      className="group flex items-center gap-4 px-4 py-2.5 hover:bg-zed-element/50 dark:hover:bg-zed-dark-element/50 cursor-pointer transition-colors border-b border-zed-border/10 last:border-0"
    >
      <div className={`w-4 text-center text-[10px] font-black uppercase ${statusColors[file.status]}`}>
        {file.status[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zed-text dark:text-zed-dark-text truncate">
          {file.path.split('/').pop()}
        </div>
        <div className="text-[10px] text-zed-muted dark:text-zed-dark-muted opacity-50 truncate">
          {file.path}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <button className="p-1 hover:text-zed-accent" title="View Diff"><FileTextOutlined /></button>
        <button className="p-1 hover:text-commit-fix" title="Discard Changes"><UndoOutlined /></button>
      </div>
    </div>
  );
};
