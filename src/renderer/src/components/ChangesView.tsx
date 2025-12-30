import React, { useState, useEffect, useCallback } from "react";
import { WorkingTreeStatus, StatusFile } from "@shared/types";
import { 
  CloudUploadOutlined, 
  SendOutlined, 
  PlusOutlined, 
  MinusOutlined,
  UndoOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { DiffModal } from "./DiffModal";
import { useToast } from "./ToastContext";

interface ChangesViewProps {
  repoPath: string;
}

export const ChangesView: React.FC<ChangesViewProps> = ({ repoPath }) => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<WorkingTreeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<StatusFile | null>(null);
  const [diffContent, setDiffContent] = useState<string>("");
  const [isDiffVisible, setIsDiffVisible] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await window.gitnetAPI.getStatus(repoPath);
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    } finally {
      setLoading(false);
    }
  }, [repoPath]);

  useEffect(() => {
    fetchStatus();
    const unsubscribeRepo = window.gitnetAPI.onRepositoryChanged(fetchStatus);
    const unsubscribeHead = window.gitnetAPI.onHeadChanged(fetchStatus);
    const unsubscribeCommits = window.gitnetAPI.onCommitsUpdated(fetchStatus);
    return () => {
      unsubscribeRepo();
      unsubscribeHead();
      unsubscribeCommits();
    };
  }, [fetchStatus]);

  const handleFileClick = async (file: StatusFile) => {
    setSelectedFile(file);
    setIsDiffVisible(true);
    setDiffContent("Loading diff...");
    try {
      const diff = await window.gitnetAPI.getDiff(repoPath, file.staged ? "HEAD" : "", file.path);
      setDiffContent(diff);
    } catch (err) {
      setDiffContent("Failed to load diff.");
    }
  };

  const handleStage = async (file: StatusFile, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.gitnetAPI.stageFile(repoPath, file.path);
      fetchStatus();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to stage file", "error");
    }
  };

  const handleUnstage = async (file: StatusFile, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await window.gitnetAPI.unstageFile(repoPath, file.path);
      fetchStatus();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to unstage file", "error");
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      showToast("Enter a commit message", "info");
      return;
    }
    setIsCommitting(true);
    try {
      await window.gitnetAPI.commit(repoPath, commitMessage);
      setCommitMessage("");
      showToast("Committed", "success");
      fetchStatus();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Commit failed", "error");
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      await window.gitnetAPI.push(repoPath);
      showToast("Pushed successfully", "success");
      fetchStatus();
    } catch (err) {
      showToast("Push failed", "error");
    } finally {
      setIsPushing(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-full bg-zed-bg dark:bg-zed-dark-bg">
        <div className="text-xs font-mono text-zed-text dark:text-zed-dark-text animate-pulse uppercase tracking-[0.2em]">
          Scanning Working Tree
        </div>
      </div>
    );
  }

  const stagedFiles = status?.files.filter(f => f.staged) || [];
  const unstagedFiles = status?.files.filter(f => !f.staged) || [];

  return (
    <div className="h-full flex flex-col bg-zed-bg dark:bg-zed-dark-bg text-zed-text dark:text-zed-dark-text font-sans selection:bg-zed-accent/30 dark:selection:bg-zed-dark-accent/30">
      {/* High-contrast Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-zed-border dark:border-zed-dark-border bg-zed-surface dark:bg-zed-dark-surface">
        <div className="flex items-center gap-4">
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-zed-text dark:text-zed-dark-text">
            Changes
          </h1>
          {status && (status.ahead > 0 || status.behind > 0) && (
            <div className="flex gap-2">
              {status.ahead > 0 && (
                <span className="text-[10px] font-mono font-bold text-white bg-zed-accent dark:bg-zed-dark-accent px-2 py-0.5 rounded-sm">
                  ↑{status.ahead}
                </span>
              )}
              {status.behind > 0 && (
                <span className="text-[10px] font-mono font-bold text-white bg-commit-fix px-2 py-0.5 rounded-sm">
                  ↓{status.behind}
                </span>
              )}
            </div>
          )}
        </div>

        {status && status.ahead > 0 && (
          <button
            onClick={handlePush}
            disabled={isPushing}
            className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-zed-accent dark:bg-zed-dark-accent text-white hover:opacity-90 transition-all disabled:opacity-30"
          >
            <CloudUploadOutlined className={isPushing ? "animate-bounce" : ""} />
            {isPushing ? "Pushing" : "Push to Remote"}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto py-8 px-6 space-y-12">
          {/* STAGED SECTION */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-zed-border dark:border-zed-dark-border pb-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-green-600 dark:text-green-400 flex items-center gap-2">
                <PlusOutlined className="text-[9px]" /> Staged ({stagedFiles.length})
              </h2>
            </div>
            
            {stagedFiles.length > 0 ? (
              <div className="space-y-px">
                {stagedFiles.map(file => (
                  <ZedFileRow 
                    key={file.path} 
                    file={file} 
                    onClick={() => handleFileClick(file)} 
                    onAction={(e) => handleUnstage(file, e)}
                    actionIcon={<MinusOutlined />}
                    isStaged
                  />
                ))}
              </div>
            ) : (
              <div className="py-6 px-2 text-[11px] font-mono text-zed-muted dark:text-zed-dark-muted italic border border-dashed border-zed-border/40 dark:border-zed-dark-border/40 rounded-sm text-center">
                No files staged for commit.
              </div>
            )}
          </section>

          {/* UNSTAGED SECTION */}
          <section>
            <div className="flex items-center justify-between mb-4 border-b border-zed-border dark:border-zed-dark-border pb-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-zed-text dark:text-zed-dark-text flex items-center gap-2">
                <FileTextOutlined className="text-[9px]" /> Working Directory ({unstagedFiles.length})
              </h2>
            </div>

            {unstagedFiles.length > 0 ? (
              <div className="space-y-px">
                {unstagedFiles.map(file => (
                  <ZedFileRow 
                    key={file.path} 
                    file={file} 
                    onClick={() => handleFileClick(file)} 
                    onAction={(e) => handleStage(file, e)}
                    actionIcon={<PlusOutlined />}
                  />
                ))}
              </div>
            ) : (
              <div className="py-6 px-2 text-[11px] font-mono text-zed-muted dark:text-zed-dark-muted italic border border-dashed border-zed-border/40 dark:border-zed-dark-border/40 rounded-sm text-center">
                Your working tree is clean.
              </div>
            )}
          </section>
        </div>
      </div>

      {/* High-Contrast Commit Footer */}
      <div className="shrink-0 p-6 bg-zed-surface dark:bg-zed-dark-surface border-t border-zed-border dark:border-zed-dark-border shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-end gap-6">
          <div className="flex-1">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zed-text dark:text-zed-dark-text mb-3">
              Commit Message
            </label>
            <textarea
              placeholder="Explain your changes..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border p-3 text-sm focus:outline-none focus:border-zed-accent dark:focus:border-zed-dark-accent placeholder:text-zed-muted/50 dark:placeholder:text-zed-dark-muted/50 text-zed-text dark:text-zed-dark-text resize-none font-sans rounded-sm shadow-inner"
              rows={2}
            />
          </div>
          <button
            onClick={handleCommit}
            disabled={isCommitting || stagedFiles.length === 0}
            className={`flex items-center gap-3 px-8 py-3 rounded-sm font-black uppercase tracking-[0.2em] text-[11px] transition-all duration-200 shadow-sm ${
              isCommitting || stagedFiles.length === 0
                ? "bg-zed-element dark:bg-zed-dark-element text-zed-muted dark:text-zed-dark-muted cursor-not-allowed border border-zed-border dark:border-zed-dark-border"
                : "bg-zed-text dark:bg-zed-dark-text text-zed-bg dark:text-zed-dark-bg hover:shadow-md active:scale-[0.98] border border-transparent"
            }`}
          >
            {isCommitting ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Processing</span>
              </span>
            ) : (
              <>
                <span>Commit</span>
                <SendOutlined className="text-[10px]" />
              </>
            )}
          </button>
        </div>
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

const ZedFileRow: React.FC<{ 
  file: StatusFile; 
  onClick: () => void;
  onAction: (e: React.MouseEvent) => void;
  actionIcon: React.ReactNode;
  isStaged?: boolean;
}> = ({ file, onClick, onAction, actionIcon, isStaged }) => {
  const statusConfig = {
    added: { char: "A", color: "text-green-600 dark:text-green-400" },
    modified: { char: "M", color: "text-yellow-600 dark:text-yellow-400" },
    deleted: { char: "D", color: "text-red-600 dark:text-red-400" },
    renamed: { char: "R", color: "text-blue-600 dark:text-blue-400" },
    untracked: { char: "?", color: "text-zed-text dark:text-zed-dark-text opacity-60" },
    conflicted: { char: "U", color: "text-commit-fix animate-pulse font-bold" }
  };

  const config = statusConfig[file.status];

  return (
    <div 
      onClick={onClick}
      className="group flex items-center gap-4 py-2.5 px-3 hover:bg-zed-element dark:hover:bg-zed-dark-element transition-all cursor-pointer border-b border-zed-border/10 dark:border-zed-dark-border/10 last:border-0"
    >
      <div className={`w-5 text-center text-[11px] font-mono font-black ${config.color}`}>
        {config.char}
      </div>
      
      <div className="flex-1 flex items-baseline gap-4 min-w-0">
        <span className="text-sm font-bold text-zed-text dark:text-zed-dark-text truncate">
          {file.path.split('/').pop()}
        </span>
        <span className="text-[10px] font-mono text-zed-text dark:text-zed-dark-text opacity-50 truncate flex-1">
          {file.path.split('/').slice(0, -1).join('/') || './'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button 
          className="p-2 text-xs bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border text-zed-text dark:text-zed-dark-text hover:text-zed-accent dark:hover:text-zed-dark-accent hover:border-zed-accent dark:hover:border-zed-dark-accent rounded-sm transition-all shadow-sm group-hover:opacity-100 opacity-0"
          onClick={onAction}
          title={isStaged ? "Unstage" : "Stage"}
        >
          {actionIcon}
        </button>
        <button 
          className="p-2 text-xs bg-zed-bg dark:bg-zed-dark-bg border border-zed-border dark:border-zed-dark-border text-zed-text dark:text-zed-dark-text hover:text-commit-fix hover:border-commit-fix rounded-sm transition-all shadow-sm group-hover:opacity-100 opacity-0"
          title="Discard"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <UndoOutlined />
        </button>
      </div>
    </div>
  );
};
