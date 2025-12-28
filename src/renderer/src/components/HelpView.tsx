import React from 'react';

export const HelpView: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto bg-zed-bg dark:bg-zed-dark-bg selection:bg-zed-accent/30 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto px-8 py-20 space-y-24 text-zed-text dark:text-zed-dark-text font-sans antialiased">
        
        {/* Abstract */}
        <section className="space-y-4">
          <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-zed-accent dark:text-zed-dark-accent font-mono">GitNet / Reference</h1>
          <p className="text-lg leading-relaxed text-zed-text dark:text-zed-dark-text opacity-100 dark:opacity-100">
            GitNet is a non-linear version control visualizer. It maps the Directed Acyclic Graph (DAG) of a Git repository onto a stable, multi-lane grid system optimized for architectural clarity.
          </p>
        </section>

        {/* 01. The Visualization Engine */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">01</span>
            <h2 className="text-lg font-bold tracking-tight">The Visualization Engine</h2>
          </div>
          
          <div className="space-y-12 pl-8 border-l border-zed-border dark:border-zed-dark-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zed-text dark:text-zed-dark-text">Railway Algorithm</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                The engine uses a lane-persistent layout. The project spine (main/master) is anchored to the leftmost lane. Parallel work is assigned to secondary lanes that persist until a merge or deletion occurs, preventing visual jitter during scrolling.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zed-muted dark:text-zed-dark-muted text-[10px]">Symbolic Encoding</h3>
              <div className="grid grid-cols-1 gap-6 text-sm">
                <div className="flex gap-6">
                  <div className="w-1/3 shrink-0 text-zed-muted dark:text-zed-dark-text/60 font-medium">Node Color</div>
                  <div className="space-y-2">
                    <p className="text-zed-text dark:text-zed-dark-text">Colors indicate the semantic intent of a commit based on the <span className="text-zed-accent dark:text-zed-dark-accent font-semibold">Conventional Commits</span> specification.</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-commit-feat shadow-[0_0_10px_rgba(152,195,121,0.3)]"></span> <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-text/70">feat</span></div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-commit-fix shadow-[0_0_10px_rgba(224,108,117,0.3)]"></span> <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-text/70">fix</span></div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-commit-refactor shadow-[0_0_10px_rgba(229,192,123,0.3)]"></span> <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-text/70">refac</span></div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-commit-docs shadow-[0_0_10px_rgba(97,175,239,0.3)]"></span> <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-text/70">docs</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-6 border-t border-zed-border dark:border-zed-dark-border/50 pt-6">
                  <div className="w-1/3 shrink-0 text-zed-muted dark:text-zed-dark-text/60 font-medium">Node Geometry</div>
                  <div className="space-y-2">
                    <p className="text-zed-text dark:text-zed-dark-text">Shapes represent structural events in the history.</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-mono">
                      <div className="flex items-center gap-2"><span className="text-zed-muted dark:text-zed-dark-text/40 text-lg">○</span> <span className="text-zed-text dark:text-zed-dark-text/80">Standard</span></div>
                      <div className="flex items-center gap-2"><span className="text-zed-accent dark:text-zed-dark-accent text-lg font-bold">◆</span> <span className="text-zed-text dark:text-zed-dark-text/80">Merge</span></div>
                      <div className="flex items-center gap-2"><span className="text-zed-muted dark:text-zed-dark-text/40 text-lg">□</span> <span className="text-zed-text dark:text-zed-dark-text/80">Revert</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02. Conventional Metadata */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">02</span>
            <h2 className="text-lg font-bold tracking-tight">Conventional Metadata</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border dark:border-zed-dark-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Semantic Commit Messages</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                GitNet automatically parses your commit subjects. Using prefixes like <code className="text-zed-accent dark:text-zed-dark-accent font-mono text-xs bg-zed-element dark:bg-zed-dark-element px-1 rounded">feat:</code> or <code className="text-zed-accent dark:text-zed-dark-accent font-mono text-xs bg-zed-element dark:bg-zed-dark-element px-1 rounded">fix:</code> allows the engine to instantly categorize work.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Branch Naming Patterns</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                Visual identity is mapped to common industry naming patterns:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mt-4">
                <div className="p-3 bg-zed-element/30 dark:bg-zed-dark-element/30 rounded border border-zed-border dark:border-zed-dark-border">
                  <span className="text-zed-accent dark:text-zed-dark-accent font-bold">feature/*</span>
                  <p className="text-zed-muted dark:text-zed-dark-text/50 mt-1 font-sans italic text-[10px]">Unique feature-lane colors.</p>
                </div>
                <div className="p-3 bg-zed-element/30 dark:bg-zed-dark-element/30 rounded border border-zed-border dark:border-zed-dark-border">
                  <span className="text-zed-accent dark:text-zed-dark-accent font-bold">hotfix/*</span>
                  <p className="text-zed-muted dark:text-zed-dark-text/50 mt-1 font-sans italic text-[10px]">Locked to high-priority Orange.</p>
                </div>
                <div className="p-3 bg-zed-element/30 dark:bg-zed-dark-element/30 rounded border border-zed-border dark:border-zed-dark-border">
                  <span className="text-zed-accent dark:text-zed-dark-accent font-bold">release/*</span>
                  <p className="text-zed-muted dark:text-zed-dark-text/50 mt-1 font-sans italic text-[10px]">Locked to stable Red.</p>
                </div>
                <div className="p-3 bg-zed-element/30 dark:bg-zed-dark-element/30 rounded border border-zed-border dark:border-zed-dark-border">
                  <span className="text-zed-accent dark:text-zed-dark-accent font-bold">develop</span>
                  <p className="text-zed-muted dark:text-zed-dark-text/50 mt-1 font-sans italic text-[10px]">Locked to Emerald Green.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 03. Interaction Logic */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">03</span>
            <h2 className="text-lg font-bold tracking-tight">Interaction Logic</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border dark:border-zed-dark-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Linear Focus Mode</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                Hovering over any node triggers a recursive lineage trace. Ancestors and Descendants are highlighted, while unrelated branches are dimmed. This isolates the "story" of a feature from the noise of the rest of the repository.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Selection & Diffs</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                Selecting a commit activates the Detail Panel. Files are presented in a hierarchical tree. Clicking a file triggers an asynchronous Git diff process, retrieving only the changes relevant to that specific delta.
              </p>
            </div>
          </div>
        </section>

        {/* 04. Commit Metadata Context */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">04</span>
            <h2 className="text-lg font-bold tracking-tight">Commit Metadata Context</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border dark:border-zed-dark-border">
            <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
              When a commit is selected, the sidebar displays all branches that contain that specific work using a hierarchical highlighting system:
            </p>

            <div className="grid grid-cols-1 gap-4 text-xs">
              <div className="flex gap-6 items-center">
                <div className="w-24 shrink-0 px-2 py-1 rounded-full border border-zed-accent dark:border-zed-dark-accent bg-zed-accent/10 dark:bg-zed-dark-accent/10 text-zed-accent dark:text-zed-dark-accent font-bold text-center uppercase tracking-tighter">● branch</div>
                <div className="space-y-1">
                  <p className="font-semibold text-zed-text dark:text-zed-dark-text">Branch Tip</p>
                  <p className="text-zed-muted dark:text-zed-dark-text/60 text-[11px]">The commit is the current latest endpoint (HEAD) of this branch.</p>
                </div>
              </div>

              <div className="flex gap-6 items-center">
                <div className="w-24 shrink-0 px-2 py-1 rounded-full border border-zed-border dark:border-zed-dark-border bg-zed-element dark:bg-zed-dark-element text-zed-text dark:text-zed-dark-text font-medium text-center uppercase tracking-tighter">branch</div>
                <div className="space-y-1">
                  <p className="font-semibold text-zed-text dark:text-zed-dark-text">Inferred Original</p>
                  <p className="text-zed-muted dark:text-zed-dark-text/60 text-[11px]">The primary branch context where this commit was authored.</p>
                </div>
              </div>

              <div className="flex gap-6 items-center">
                <div className="w-24 shrink-0 px-2 py-1 rounded-full bg-zed-element/50 dark:bg-zed-dark-element/50 text-zed-muted dark:text-zed-dark-text/40 text-center uppercase tracking-tighter">branch</div>
                <div className="space-y-1">
                  <p className="font-semibold text-zed-text dark:text-zed-dark-text/70">Merged / Contains</p>
                  <p className="text-zed-muted dark:text-zed-dark-text/60 text-[11px]">Branches that have incorporated this commit via merges.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05. Global Shortcuts */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">05</span>
            <h2 className="text-lg font-bold tracking-tight">Global Shortcuts</h2>
          </div>
          
          <div className="pl-8 border-l border-zed-border dark:border-zed-dark-border">
            <div className="grid grid-cols-2 gap-y-4 max-w-sm text-[11px] font-mono uppercase tracking-tighter">
              <div className="text-zed-muted dark:text-zed-dark-text/50">Sync Data</div> <div className="text-right font-bold text-zed-text dark:text-zed-dark-text">Cmd R</div>
              <div className="text-zed-muted dark:text-zed-dark-text/50">Open Repo</div> <div className="text-right font-bold text-zed-text dark:text-zed-dark-text">Cmd O</div>
              <div className="text-zed-muted dark:text-zed-dark-text/50">Escape View</div> <div className="text-right font-bold text-zed-text dark:text-zed-dark-text">Esc</div>
              <div className="text-zed-muted dark:text-zed-dark-text/30 border-t border-zed-border dark:border-zed-dark-border/50 pt-4">Search Tags</div> <div className="text-right border-t border-zed-border dark:border-zed-dark-border/50 pt-4 font-bold text-zed-accent dark:text-zed-dark-accent">tag:</div>
              <div className="text-zed-muted dark:text-zed-dark-text/30">Search Author</div> <div className="text-right font-bold text-zed-accent dark:text-zed-dark-accent">author:</div>
              <div className="text-zed-muted dark:text-zed-dark-text/30">Jump Hash</div> <div className="text-right font-bold text-zed-accent dark:text-zed-dark-accent"># [hash]</div>
            </div>
          </div>
        </section>

        {/* 06. Analytical Insights */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">06</span>
            <h2 className="text-lg font-bold tracking-tight">Analytical Insights</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border dark:border-zed-dark-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Hotspot Detection</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                The <span className="text-zed-text dark:text-zed-dark-text font-bold underline decoration-zed-accent/30 decoration-2 underline-offset-2">Hot Files</span> algorithm identifies high-churn areas of the codebase that may require refactoring due to frequent instability.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Contributor Engagement</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                Activity heatmaps provide a chronological perspective on project momentum and identify key contributors based on their historical impact.
              </p>
            </div>
          </div>
        </section>

        {/* 07. Advanced Structural Patterns */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">07</span>
            <h2 className="text-lg font-bold tracking-tight">Advanced Structural Patterns</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border dark:border-zed-dark-border text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-zed-text dark:text-zed-dark-text uppercase tracking-widest">Fast-Forward Merges</h4>
                <p className="text-zed-muted dark:text-zed-dark-text/70 leading-relaxed text-[13px]">Linear merges are represented as a continuous vertical line to preserve project spine integrity.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-zed-text dark:text-zed-dark-text uppercase tracking-widest">Squash & Rebase</h4>
                <p className="text-zed-muted dark:text-zed-dark-text/70 leading-relaxed text-[13px]">Rewritten history is automatically recalculated to maintain the most compact visual representation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 08. State Synchronization */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">08</span>
            <h2 className="text-lg font-bold tracking-tight">State Synchronization</h2>
          </div>
          
          <div className="space-y-4 pl-8 border-l border-zed-border dark:border-zed-dark-border">
            <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
              GitNet utilizes a recursive file-watcher targeting the <code className="text-zed-accent dark:text-zed-dark-accent font-mono bg-zed-element dark:bg-zed-dark-element px-1 rounded">.git</code> directory for event-driven UI refreshes.
            </p>
            <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-zed-accent dark:text-zed-dark-accent uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-zed-accent dark:bg-zed-dark-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(97,175,239,0.5)]"></span>
              Pipeline Active
            </div>
          </div>
        </section>

        {/* 09. Data Integrity & Security */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">09</span>
            <h2 className="text-lg font-bold tracking-tight">Data Integrity & Security</h2>
          </div>
          
          <div className="space-y-4 pl-8 border-l border-zed-border dark:border-zed-dark-border">
            <ul className="text-sm space-y-6">
              <li className="flex gap-6">
                <span className="text-zed-accent dark:text-zed-dark-accent font-mono text-xs font-bold uppercase shrink-0 tracking-widest">Shield</span>
                <p className="text-zed-muted dark:text-zed-dark-text/80 text-[13px]"><strong>Read-Only Access:</strong> GitNet cannot modify history or perform destructive operations.</p>
              </li>
              <li className="flex gap-6 pt-4 border-t border-zed-border dark:border-zed-dark-border/50">
                <span className="text-zed-accent dark:text-zed-dark-accent font-mono text-xs font-bold uppercase shrink-0 tracking-widest">Local</span>
                <p className="text-zed-muted dark:text-zed-dark-text/80 text-[13px]"><strong>Offline First:</strong> Repository metadata never leaves your local machine.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* 10. Effective Visualization Techniques */}
        <section className="space-y-8 pb-12">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono text-zed-muted dark:text-zed-dark-muted opacity-50">10</span>
            <h2 className="text-lg font-bold tracking-tight text-zed-text dark:text-zed-dark-text">Visualization Strategy</h2>
          </div>
          
          <div className="space-y-10 pl-8 border-l border-zed-border dark:border-zed-dark-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zed-text dark:text-zed-dark-text">Tracing Feature Lifecycle</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                Hover over a merge commit (diamond node) and use <strong className="text-zed-text dark:text-zed-dark-text">Linear Focus</strong> to isolate the branch path back to its inception.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zed-text dark:text-zed-dark-text">Assessing Stability</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                Combine <strong className="text-zed-accent dark:text-zed-dark-accent">Hotspots</strong> with the Graph view. A high density of <span className="text-commit-fix">fix</span> commits on a hotspot file indicates high refactor priority.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zed-text dark:text-zed-dark-text">Propagational Analysis</h3>
              <p className="text-sm text-zed-muted dark:text-zed-dark-text/80 leading-relaxed">
                Check the "Merged / Contains" section in the sidebar to verify if a patch has reached your <code className="bg-zed-element dark:bg-zed-dark-element px-1 rounded font-mono">production</code> branch.
              </p>
            </div>
          </div>
        </section>

        {/* Colophon */}
        <footer className="pt-20 text-[9px] font-mono uppercase tracking-[0.5em] text-zed-muted dark:text-zed-dark-text/30 text-center">
          GitNet Visualizer / Revision 2025.12.28
        </footer>
      </div>
    </div>
  );
};