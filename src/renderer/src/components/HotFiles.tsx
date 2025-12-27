import React, { useState, useEffect } from "react";
import { HotFile } from "@shared/types";

interface HotFilesProps {
  repoPath: string;
}

export const HotFiles: React.FC<HotFilesProps> = ({ repoPath }) => {
  const [hotFiles, setHotFiles] = useState<HotFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotFiles = async () => {
      setLoading(true);
      try {
        const files = await window.gitnetAPI.getHotFiles(repoPath, 15);
        setHotFiles(files);
      } catch (error) {
        console.error("Failed to fetch hot files:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotFiles();
  }, [repoPath]);

  if (loading) {
    return <div className="text-[10px] text-zed-muted px-3 py-2 italic animate-pulse">Analyzing hotspots...</div>;
  }

  if (hotFiles.length === 0) {
    return <div className="text-[10px] text-zed-muted px-3 py-2 italic">No hotspots detected.</div>;
  }

  return (
    <div className="space-y-1 py-1">
      {hotFiles.map((file, index) => (
        <div 
          key={file.path} 
          className="flex items-center gap-2 px-2 py-1.5 hover:bg-zed-element dark:hover:bg-zed-dark-element rounded group transition-colors"
          title={`${file.count} modifications in ${file.path}`}
        >
          <div className="relative shrink-0">
             <svg className="w-3.5 h-3.5 text-zed-muted opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
             {index < 3 && (
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_4px_#ef4444]" />
             )}
          </div>
          <span className="text-[11px] text-zed-text dark:text-zed-dark-text truncate flex-1 font-mono tracking-tight opacity-80 group-hover:opacity-100">
            {file.path.split('/').pop()}
            <span className="text-[9px] text-zed-muted ml-2 font-sans opacity-50 block truncate">
              {file.path.split('/').slice(0, -1).join('/') || '/'}
            </span>
          </span>
          <div className="shrink-0 flex items-center gap-1">
             <span className={`text-[10px] font-bold ${index < 3 ? 'text-red-400' : 'text-zed-muted'}`}>
                {file.count}
             </span>
             <div className="w-8 h-1 bg-zed-border dark:bg-zed-dark-border rounded-full overflow-hidden">
                <div 
                  className={`h-full ${index < 3 ? 'bg-red-400/60' : 'bg-zed-accent/40'}`} 
                  style={{ width: `${(file.count / hotFiles[0].count) * 100}%` }} 
                />
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};
