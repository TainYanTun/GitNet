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
        const data = await window.gitnetAPI.getContributors(repoPath);
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contributors.map((author, index) => (
        <div 
          key={author.email} 
          className="group relative bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Rank Number */}
          <div className="absolute top-2 right-4 text-6xl font-black text-zed-muted/5 dark:text-zed-dark-muted/5 italic select-none pointer-events-none">
            {index + 1}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="shrink-0 w-14 h-14 border border-zed-border dark:border-zed-dark-border bg-zed-bg dark:bg-zed-dark-bg p-0.5 shadow-sm">
              <img 
                src={author.avatarUrl} 
                alt={author.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-zed-text dark:text-zed-dark-text truncate leading-tight">
                {author.name}
              </h3>
              <p className="text-[10px] text-zed-muted dark:text-zed-dark-muted font-mono truncate opacity-60">
                {author.email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <div className="text-[9px] uppercase tracking-widest text-zed-muted font-black">Commits</div>
                <div className="text-lg font-bold font-mono text-zed-text dark:text-zed-dark-text">
                  {author.commitCount}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[9px] uppercase tracking-widest text-zed-muted font-black">Impact</div>
                <div className="text-lg font-bold font-mono text-zed-accent">
                  +{author.additions + author.deletions}
                </div>
              </div>
            </div>

            {/* Line Distribution */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-mono text-zed-muted uppercase opacity-60">
                <span>Additions</span>
                <span>Deletions</span>
              </div>
              <div className="h-1.5 w-full bg-zed-element dark:bg-zed-dark-element flex overflow-hidden">
                <div 
                  className="bg-green-500/60 h-full transition-all duration-1000" 
                  style={{ width: `${(author.additions / (author.additions + author.deletions || 1)) * 100}%` }} 
                />
                <div 
                  className="bg-red-500/60 h-full transition-all duration-1000" 
                  style={{ width: `${(author.deletions / (author.additions + author.deletions || 1)) * 100}%` }} 
                />
              </div>
            </div>

            {/* Dates */}
            <div className="pt-2 border-t border-zed-border/30 dark:border-zed-dark-border/30 flex justify-between items-center text-[9px] font-mono text-zed-muted opacity-50 italic">
              <span>Since {moment.unix(author.firstCommit).format("MMM YYYY")}</span>
              <span>Last {moment.unix(author.lastCommit).fromNow()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
