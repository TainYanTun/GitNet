import React, { useState, useEffect, useCallback } from 'react';
import { GitCommandLog } from '@shared/types';
import { useToast } from './ToastContext';

export const GitConsole: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<GitCommandLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const history = await window.gitcanopyAPI.getGitCommandHistory();
      setLogs(history);
    } catch (error) {
      console.error('Failed to fetch git logs:', error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const handleClear = async () => {
    await window.gitcanopyAPI.clearGitCommandHistory();
    setLogs([]);
  };

  const handleCopy = (log: GitCommandLog) => {
    const fullCommand = `git ${log.args.join(' ')}`;
    navigator.clipboard.writeText(fullCommand);
    setCopiedId(log.id);
    showToast("Command copied to clipboard", "success", 2000);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full bg-zed-bg dark:bg-zed-dark-bg selection:bg-zed-accent/30 flex flex-col font-mono text-[11px] animate-in fade-in duration-500">
      {/* Hyper-minimalist Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-zed-border dark:border-zed-dark-border">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zed-accent">System / Git_Logs</span>
          <span className="text-zed-muted dark:text-zed-dark-text/30">|</span>
          <span className="text-zed-muted dark:text-zed-dark-text/50">Session History</span>
        </div>
        <button 
          onClick={handleClear}
          className="text-[10px] uppercase font-bold tracking-widest text-zed-muted dark:text-zed-dark-text/40 hover:text-commit-fix transition-colors"
        >
          [ Clear_All ]
        </button>
      </header>

      {/* Log Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zed-muted dark:text-zed-dark-text/20 italic">
            Waiting for Git operations...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="group flex items-start gap-4 py-1 hover:bg-zed-element/30 dark:hover:bg-zed-dark-element/30 rounded px-2 -mx-2 transition-colors">
              <span className="shrink-0 w-16 text-zed-muted dark:text-zed-dark-text/30 text-[10px] pt-0.5">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              
              <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${log.success ? 'bg-commit-feat/50' : 'bg-commit-fix shadow-[0_0_8px_rgba(224,108,117,0.5)]'}`}></span>
              
              <div className="flex-1 flex flex-wrap items-baseline gap-x-2 min-w-0 select-text">
                <span className="text-zed-accent dark:text-zed-dark-accent font-bold">git</span>
                <span className="text-zed-text dark:text-zed-dark-text font-medium">{log.args.join(' ')}</span>
              </div>

              <div className="shrink-0 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-zed-muted dark:text-zed-dark-text/30 text-[9px] uppercase tracking-tighter">{log.duration}ms</span>
                <span className={`text-[9px] font-bold px-1 rounded border ${log.success ? 'border-commit-feat/30 text-commit-feat' : 'border-commit-fix/30 text-commit-fix'}`}>
                  {log.exitCode}
                </span>
                <button
                  onClick={() => handleCopy(log)}
                  className={`p-1 rounded hover:bg-zed-element dark:hover:bg-zed-dark-element transition-colors ${copiedId === log.id ? 'text-commit-feat' : 'text-zed-muted'}`}
                  title="Copy command"
                >
                  {copiedId === log.id ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};