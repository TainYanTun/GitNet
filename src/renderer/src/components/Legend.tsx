import React, { useState } from "react";

export const Legend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-start pointer-events-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-1.5 bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border rounded text-[10px] uppercase font-bold text-zed-muted dark:text-zed-dark-muted hover:text-zed-text dark:hover:text-zed-dark-text hover:border-zed-accent/50 transition-all select-none"
      >
        <span>Legend</span>
        <div className={`w-1.5 h-1.5 border-r border-b border-current transition-transform duration-200 ${isOpen ? "-rotate-135 translate-y-0.5" : "rotate-45 -translate-y-0.5"}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-zed-surface dark:bg-zed-dark-surface border border-zed-border dark:border-zed-dark-border p-3 rounded shadow-sm w-48 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="grid grid-cols-2 gap-y-2 gap-x-2">
            {/* Shapes */}
            <div className="col-span-2 text-[10px] font-bold text-zed-muted/50 uppercase tracking-widest mb-1">
              Shapes
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zed-accent"></div>
              <span className="text-[10px] text-zed-muted uppercase tracking-wider">Commit</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-zed-muted rotate-45"></div>
              <span className="text-[10px] text-zed-muted uppercase tracking-wider">Merge</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#cbd5e1] rounded-sm"></div>
              <span className="text-[10px] text-zed-muted uppercase tracking-wider">Stash</span>
            </div>

            {/* Colors */}
            <div className="col-span-2 text-[10px] font-bold text-zed-muted/50 uppercase tracking-widest mt-2 mb-1">
              Types
            </div>

            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></div>
              <span className="text-[10px] text-zed-muted">Feat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></div>
              <span className="text-[10px] text-zed-muted">Fix</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ec4899]"></div>
              <span className="text-[10px] text-zed-muted">Docs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></div>
              <span className="text-[10px] text-zed-muted">Chore</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-zed-border dark:border-zed-dark-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 border-t border-dashed border-zed-muted"></div>
              <span className="text-[9px] text-zed-muted uppercase tracking-wider opacity-75">Merge Path</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
