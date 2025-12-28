import React, { useState, useEffect } from 'react';
import { GitCommandLog } from '@shared/types';

export const GitConsole: React.FC = () => {
  const [logs, setLogs] = useState<GitCommandLog[]>([]);

  const fetchLogs = async () => {
    try {
      const history = await window.gitnetAPI.getGitCommandHistory();
      setLogs(history);
    } catch (error) {
      console.error('Failed to fetch git logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000); // Poll for new commands
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-zed-bg dark:bg-zed-dark-bg p-6 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-zed-border dark:border-zed-dark-border pb-4">
          <div>
            <h1 className="text-xl font-bold text-zed-text dark:text-zed-dark-text">Git Output Console</h1>
            <p className="text-xs text-zed-muted dark:text-zed-dark-muted">Transparent log of all Git CLI commands executed by GitNet.</p>
          </div>
          <button 
            onClick={fetchLogs}
            className="p-2 rounded hover:bg-zed-element dark:hover:bg-zed-dark-element text-zed-muted transition-colors"
            title="Refresh logs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </header>

        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="text-center py-20 text-zed-muted opacity-50 italic text-sm font-mono">
              No Git commands recorded in this session.
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className="group border border-zed-border dark:border-zed-dark-border rounded-lg bg-zed-surface/30 dark:bg-zed-dark-surface/30 overflow-hidden font-mono text-[11px]"
              >
                <div className="flex items-center justify-between px-3 py-2 bg-zed-element/50 dark:bg-zed-dark-element/50 border-b border-zed-border dark:border-zed-dark-border">
                  <div className="flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full ${log.success ? 'bg-commit-feat' : 'bg-commit-fix'}`}></span>
                    <span className="text-zed-text dark:text-zed-dark-text font-bold">git {log.args[0]}</span>
                    <span className="text-zed-muted opacity-50">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="text-zed-muted">{log.duration}ms</span>
                    <span className={log.success ? 'text-commit-feat' : 'text-commit-fix'}>
                      EXIT {log.exitCode}
                    </span>
                  </div>
                </div>
                <div className="p-3 whitespace-pre-wrap break-all text-zed-text dark:text-zed-dark-text opacity-80 leading-relaxed">
                  <span className="text-zed-accent opacity-60 mr-2">$</span>
                  git {log.args.join(' ')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
