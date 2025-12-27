import React, { useState } from "react";
import { FileChange } from "@shared/types";

interface FileTreeNode {
  name: string;
  path: string;
  children: Map<string, FileTreeNode>;
  change?: FileChange;
  isFolder: boolean;
}

interface FileTreeProps {
  files: FileChange[];
  onFileClick: (file: FileChange) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ files, onFileClick }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root"]));

  // Build the tree
  const root: FileTreeNode = { name: "root", path: "", children: new Map(), isFolder: true };
  
  files.forEach(file => {
    const parts = file.path.split("/");
    let current = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = index === parts.length - 1;

      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          path: currentPath,
          children: new Map(),
          isFolder: !isLast,
          change: isLast ? file : undefined
        });
      }
      current = current.children.get(part)!;
    });
  });

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "A": return "text-green-500";
      case "M": return "text-yellow-500";
      case "D": return "text-red-500";
      case "R": return "text-blue-500";
      default: return "text-zed-muted";
    }
  };

  const renderNode = (node: FileTreeNode, depth: number) => {
    const isExpanded = expandedFolders.has(node.path);
    const sortedChildren = Array.from(node.children.values()).sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
    });

    if (node.path === "") {
        return <div className="space-y-0.5">{sortedChildren.map(child => renderNode(child, 0))}</div>;
    }

    return (
      <div key={node.path} className="select-none">
        <div 
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zed-element dark:hover:bg-zed-dark-element cursor-pointer group transition-colors relative"
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => node.isFolder ? toggleFolder(node.path) : node.change && onFileClick(node.change)}
        >
          {/* Indentation Guide */}
          {depth > 0 && (
            <div 
              className="absolute left-0 top-0 bottom-0 border-l border-zed-border/30 dark:border-zed-dark-border/30"
              style={{ left: `${(depth * 16) - 2}px` }}
            />
          )}

          {node.isFolder ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <svg 
                  className={`w-3.5 h-3.5 text-zed-muted/80 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
                <svg className="w-4 h-4 text-zed-accent/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="text-[11px] font-semibold text-zed-muted dark:text-zed-dark-muted truncate uppercase tracking-tight">
                    {node.name}
                </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <svg className="w-3.5 h-3.5 text-zed-text/40 dark:text-zed-dark-text/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[12px] text-zed-text dark:text-zed-dark-text truncate group-hover:text-zed-accent transition-colors">
                    {node.name}
                </span>
                
                {/* Status Badge */}
                <div className={`ml-auto shrink-0 w-4 h-4 flex items-center justify-center rounded text-[9px] font-bold border border-current opacity-80 ${getStatusColor(node.change?.status)}`}>
                  {node.change?.status}
                </div>
            </div>
          )}
        </div>

        {node.isFolder && isExpanded && (
          <div className="flex flex-col">
            {sortedChildren.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-1">
      {renderNode(root, 0)}
    </div>
  );
};
