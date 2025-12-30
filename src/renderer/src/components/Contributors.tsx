import React, { useState, useEffect } from "react";
import { ContributorStats } from "@shared/types";
import moment from "moment";

interface ContributorsProps {
  repoPath: string;
}

export const Contributors: React.FC<ContributorsProps> = ({ repoPath }) => {
  const [contributors, setContributors] = useState<ContributorStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributors = async () => {
      setLoading(true);
      try {
        const data = await window.gitcanopyAPI.getContributors(repoPath);
        setContributors(data);
      } catch (error) {
        console.error("Failed to fetch contributors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContributors();
  }, [repoPath]);

  if (loading) {
    return <div className="p-8 text-[10px] font-mono text-zed-muted animate-pulse uppercase tracking-widest text-center">Analyzing team metrics...</div>;
  }

  return (
    <div className="w-full">
      <div className="divide-y divide-zed-border/20 dark:divide-zed-dark-border/20">
        {contributors.map((author, index) => (
          <div 
            key={author.email} 
            className="group flex items-center gap-6 py-4 hover:bg-zed-bg/50 dark:hover:bg-zed-dark-bg/50 transition-colors duration-150 border-zed-border/10 dark:border-zed-dark-border/10 px-2"
          >
            {/* Minimal Rank */}
            <div className="w-4 text-[10px] font-mono text-zed-muted/40 font-bold">
              {(index + 1).toString().padStart(2, '0')}
            </div>

            {/* Avatar - Tiny & Grayscale */}
            <div className="w-6 h-6 grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300 overflow-hidden">
              <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-zed-text dark:text-zed-dark-text truncate tracking-tight">
                {author.name}
              </h3>
              <p className="text-[9px] font-mono text-zed-muted dark:text-zed-dark-muted opacity-50 truncate">
                {author.email}
              </p>
            </div>

            {/* Hyper-Minimalist Activity Chart */}
            <div className="w-32 h-6 flex items-end gap-0.5 opacity-20 group-hover:opacity-60 transition-opacity px-4">
              {(author.activity || []).map((count, i) => {
                const max = Math.max(...(author.activity || [1]), 1);
                const height = (count / max) * 100;
                return (
                  <div 
                    key={i} 
                    className="flex-1 bg-zed-text dark:bg-zed-dark-text" 
                    style={{ height: `${Math.max(10, height)}%` }}
                  />
                );
              })}
            </div>

            {/* Core Stats - Flat */}
            <div className="flex items-center gap-12 text-right pr-4">
              <div className="w-16">
                <div className="text-[11px] font-bold font-mono text-zed-text dark:text-zed-dark-text leading-none">
                  {author.commitCount}
                </div>
                <div className="text-[8px] font-black uppercase tracking-tighter text-zed-muted opacity-40">Commits</div>
              </div>
              
              <div className="w-20">
                <div className="text-[11px] font-bold font-mono text-zed-text dark:text-zed-dark-text leading-none">
                  {author.additions + author.deletions}
                </div>
                <div className="text-[8px] font-black uppercase tracking-tighter text-zed-muted opacity-40">Impact</div>
              </div>

              <div className="w-24 hidden md:block">
                <div className="text-[10px] font-mono text-zed-muted dark:text-zed-dark-muted leading-none">
                  {moment.unix(author.lastCommit).fromNow(true)}
                </div>
                <div className="text-[8px] font-black uppercase tracking-tighter text-zed-muted opacity-40 whitespace-nowrap text-right">Idle</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
