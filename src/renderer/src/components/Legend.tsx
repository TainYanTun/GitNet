import React, { useState } from "react";

export const Legend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-zed-surface/90 dark:bg-zed-dark-surface/90 backdrop-blur-md p-2 rounded-full border border-zed-border dark:border-zed-dark-border shadow-lg hover:text-zed-accent transition-colors"
        title="Show Legend"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="bg-zed-surface/95 dark:bg-zed-dark-surface/95 backdrop-blur-xl p-4 rounded-xl border border-zed-border dark:border-zed-dark-border shadow-2xl w-64 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-4 border-b border-zed-border dark:border-zed-dark-border pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zed-muted">Graph Legend</h3>
        <button onClick={() => setIsOpen(false)} className="text-zed-muted hover:text-zed-text transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Node Shapes */}
        <section>
          <h4 className="text-[10px] font-bold text-zed-muted uppercase mb-2">Commit Types</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-zed-muted/50 flex items-center justify-center text-[8px] font-bold text-white">F</div>
              <span className="text-xs text-zed-text dark:text-zed-dark-text">Regular Commit</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-zed-muted/50 rotate-45 flex items-center justify-center border border-white/20 shadow-sm overflow-hidden">
                 <div className="w-full h-full bg-zed-muted/20 -rotate-45 flex items-center justify-center text-[6px]">👤</div>
              </div>
              <span className="text-xs text-zed-text dark:text-zed-dark-text">Merge (Diamond)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-zed-muted/50 flex items-center justify-center text-[8px] font-bold text-white">R</div>
              <span className="text-xs text-zed-text dark:text-zed-dark-text">Revert (Square)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-[#cbd5e1] flex items-center justify-center text-[8px] font-bold text-slate-700">S</div>
              <span className="text-xs text-zed-text dark:text-zed-dark-text">Stash (Square)</span>
            </div>
          </div>
        </section>

        {/* Connections */}
        <section>
          <h4 className="text-[10px] font-bold text-zed-muted uppercase mb-2">Connections</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 bg-zed-muted/50"></div>
              <span className="text-xs text-zed-text dark:text-zed-dark-text">Direct Path</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-zed-muted/50"></div>
              <span className="text-xs text-zed-text dark:text-zed-dark-text">Merge Connection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-zed-accent/40 animate-pulse"></div>
              <span className="text-xs text-zed-text dark:text-zed-dark-text">Current HEAD</span>
            </div>
          </div>
        </section>

        {/* Branch Colors */}
        <section>
          <h4 className="text-[10px] font-bold text-zed-muted uppercase mb-2">Branch Colors</h4>
          <div className="grid grid-cols-1 gap-2 text-[11px]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#1f2937]"></div>
              <span className="text-zed-text dark:text-zed-dark-text">Main / Master</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#059669]"></div>
              <span className="text-zed-text dark:text-zed-dark-text">Develop</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#ea580c]"></div>
              <span className="text-zed-text dark:text-zed-dark-text">Hotfix</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#2563eb]"></div>
              <span className="text-zed-text dark:text-zed-dark-text">Feature / Others</span>
            </div>
          </div>
        </section>

        <section className="pt-2 border-t border-zed-border dark:border-zed-dark-border mt-2">
          <p className="text-[10px] text-zed-muted italic">
            Tip: Hover a node to see its full lineage and history path.
          </p>
        </section>
      </div>
    </div>
  );
};
