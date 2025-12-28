import React from 'react';

export const HelpView: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto bg-zed-bg dark:bg-zed-dark-bg selection:bg-zed-accent/30 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto px-8 py-20 space-y-24 text-zed-text dark:text-zed-dark-text font-sans antialiased">
        
        {/* Abstract */}
        <section className="space-y-4">
          <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-zed-accent font-mono">GitNet / Reference</h1>
          <p className="text-lg leading-relaxed opacity-90">
            GitNet is a non-linear version control visualizer. It maps the Directed Acyclic Graph (DAG) of a Git repository onto a stable, multi-lane grid system optimized for architectural clarity.
          </p>
        </section>

        {/* 01. The Visualization Engine */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono opacity-30">01</span>
            <h2 className="text-lg font-bold tracking-tight">The Visualization Engine</h2>
          </div>
          
          <div className="space-y-12 pl-8 border-l border-zed-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Railway Algorithm</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                The engine uses a lane-persistent layout. The project spine (main/master) is anchored to the leftmost lane. Parallel work is assigned to secondary lanes that persist until a merge or deletion occurs, preventing visual jitter during scrolling.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zed-muted text-[10px]">Symbolic Encoding</h3>
              <div className="grid grid-cols-1 gap-6 text-sm">
                <div className="flex gap-6">
                  <div className="w-1/3 shrink-0 opacity-60 font-medium">Node Color</div>
                  <div className="space-y-2">
                    <p>Colors indicate the semantic intent of a commit based on the <span className="text-zed-accent">Conventional Commits</span> specification.</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-commit-feat"></span> <span className="text-xs font-mono">feat</span></div>
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-commit-fix"></span> <span className="text-xs font-mono">fix</span></div>
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-commit-refactor"></span> <span className="text-xs font-mono">refac</span></div>
                      <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-commit-docs"></span> <span className="text-xs font-mono">docs</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-6 border-t border-zed-border/50 pt-6">
                  <div className="w-1/3 shrink-0 opacity-60 font-medium">Node Geometry</div>
                  <div className="space-y-2">
                    <p>Shapes represent structural events in the history.</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-mono">
                      <div className="flex items-center gap-2"><span className="opacity-40 text-lg">○</span> <span>Standard</span></div>
                      <div className="flex items-center gap-2"><span className="text-zed-accent text-lg">◆</span> <span>Merge</span></div>
                      <div className="flex items-center gap-2"><span className="opacity-40 text-lg">□</span> <span>Revert</span></div>
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
            <span className="text-xs font-mono opacity-30">02</span>
            <h2 className="text-lg font-bold tracking-tight">Conventional Metadata</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Semantic Commit Messages</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                GitNet automatically parses your commit subjects. Using prefixes like <code className="text-zed-accent font-mono text-xs">feat:</code> or <code className="text-zed-accent font-mono text-xs">fix:</code> allows the engine to instantly categorize work and apply appropriate color coding to nodes.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Branch Naming Patterns</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                The visual identity of a branch is determined by its name. GitNet recognizes common industry patterns:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mt-4">
                <div className="p-3 bg-zed-element/30 rounded border border-zed-border">
                  <span className="text-zed-accent">feature/*</span>
                  <p className="text-zed-muted mt-1 opacity-60 font-sans italic text-[10px]">Assigns unique feature colors.</p>
                </div>
                <div className="p-3 bg-zed-element/30 rounded border border-zed-border">
                  <span className="text-zed-accent">hotfix/*</span>
                  <p className="text-zed-muted mt-1 opacity-60 font-sans italic text-[10px]">Locked to high-priority Orange.</p>
                </div>
                <div className="p-3 bg-zed-element/30 rounded border border-zed-border">
                  <span className="text-zed-accent">release/*</span>
                  <p className="text-zed-muted mt-1 opacity-60 font-sans italic text-[10px]">Locked to stable Red.</p>
                </div>
                <div className="p-3 bg-zed-element/30 rounded border border-zed-border">
                  <span className="text-zed-accent">develop</span>
                  <p className="text-zed-muted mt-1 opacity-60 font-sans italic text-[10px]">Locked to Emerald Green.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 03. Interaction Logic */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono opacity-30">03</span>
            <h2 className="text-lg font-bold tracking-tight">Interaction Logic</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Linear Focus Mode</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                Hovering over any node triggers a recursive lineage trace. Ancestors (input commits) and Descendants (resultant commits) are highlighted, while unrelated branches are dimmed. This isolates the "story" of a feature from the noise of the rest of the repository.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Selection & Diffs</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                Selecting a commit activates the Detail Panel. Files are presented in a hierarchical tree. Clicking a file triggers an asynchronous Git diff process, retrieving only the changes relevant to that specific delta for maximum performance.
              </p>
            </div>
          </div>
        </section>

        {/* 04. Commit Metadata Context */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono opacity-30">04</span>
            <h2 className="text-lg font-bold tracking-tight">Commit Metadata Context</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border">
            <p className="text-sm text-zed-muted leading-relaxed">
              When a commit is selected, the sidebar displays all branches that contain that specific work. GitNet uses a hierarchical highlighting system to distinguish the commit's relationship to the repository:
            </p>

            <div className="grid grid-cols-1 gap-4 text-xs">
              <div className="flex gap-6 items-center">
                <div className="w-24 shrink-0 px-2 py-1 rounded-full border border-zed-accent bg-zed-accent/10 text-zed-accent font-bold text-center">● branch</div>
                <div className="space-y-1">
                  <p className="font-semibold text-zed-text">Branch Tip</p>
                  <p className="text-zed-muted text-[11px]">Indicates the commit is the current latest endpoint (HEAD) of this branch.</p>
                </div>
              </div>

              <div className="flex gap-6 items-center">
                <div className="w-24 shrink-0 px-2 py-1 rounded-full border border-zed-muted bg-zed-element text-zed-text font-medium text-center">branch</div>
                <div className="space-y-1">
                  <p className="font-semibold text-zed-text">Inferred Original</p>
                  <p className="text-zed-muted text-[11px]">The primary branch context where this commit was likely authored.</p>
                </div>
              </div>

              <div className="flex gap-6 items-center opacity-60">
                <div className="w-24 shrink-0 px-2 py-1 rounded-full bg-zed-element text-zed-text text-center">branch</div>
                <div className="space-y-1">
                  <p className="font-semibold text-zed-text">Merged / Contains</p>
                  <p className="text-zed-muted text-[11px]">Other branches that have since incorporated this commit via merges.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05. Global Shortcuts */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono opacity-30">05</span>
            <h2 className="text-lg font-bold tracking-tight">Global Shortcuts</h2>
          </div>
          
          <div className="pl-8 border-l border-zed-border">
            <div className="grid grid-cols-2 gap-y-4 max-w-sm text-[11px] font-mono uppercase tracking-tighter">
              <div className="opacity-40">Sync Data</div> <div className="text-right font-bold">Cmd R</div>
              <div className="opacity-40">Open Repo</div> <div className="text-right font-bold">Cmd O</div>
              <div className="opacity-40">Escape View</div> <div className="text-right font-bold">Esc</div>
              <div className="opacity-40 border-t border-zed-border/50 pt-4">Search Tags</div> <div className="text-right border-t border-zed-border/50 pt-4 font-bold text-zed-accent">tag:</div>
              <div className="opacity-40">Search Author</div> <div className="text-right font-bold text-zed-accent">author:</div>
              <div className="opacity-40">Jump Hash</div> <div className="text-right font-bold text-zed-accent"># [hash]</div>
            </div>
          </div>
        </section>

        {/* 06. Analytical Insights */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono opacity-30">06</span>
            <h2 className="text-lg font-bold tracking-tight">Analytical Insights</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Hotspot Detection</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                The <span className="text-zed-text font-medium">Hot Files</span> algorithm calculates modification frequency across all paths. High-churn files are visualized as hotspots, identifying areas of the codebase that may require refactoring or more rigorous testing due to frequent instability.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Contributor Engagement</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                Activity heatmaps represent commit density over time buckets. This provides a chronological perspective on project momentum and identifies key contributors based on their historical impact and repository influence.
              </p>
            </div>
          </div>
        </section>

        {/* 07. Advanced Structural Patterns */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono opacity-30">07</span>
            <h2 className="text-lg font-bold tracking-tight">Advanced Structural Patterns</h2>
          </div>
          
          <div className="space-y-8 pl-8 border-l border-zed-border text-sm text-zed-muted">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-zed-text uppercase tracking-widest">Fast-Forward Merges</h4>
                <p className="leading-relaxed text-[13px]">Linear merges are represented as a continuous vertical line. Since no merge commit is created, the "Railway" remains straight, preserving project spine integrity.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-zed-text uppercase tracking-widest">Squash & Rebase</h4>
                <p className="leading-relaxed text-[13px]">Atomic updates are visualized as single nodes. When history is rewritten, the engine automatically recalculates lane assignments to maintain compact representation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 08. State Synchronization */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono opacity-30">08</span>
            <h2 className="text-lg font-bold tracking-tight">State Synchronization</h2>
          </div>
          
          <div className="space-y-4 pl-8 border-l border-zed-border">
            <p className="text-sm text-zed-muted leading-relaxed">
              The application utilizes a background recursive file-watcher targeting the <code className="text-zed-accent font-mono">.git</code> directory. 
              External operations performed via CLI or other editors trigger an immediate event-driven refresh of the graph and metadata.
            </p>
            <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-zed-accent uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-zed-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              Watcher Pipeline Active
            </div>
          </div>
        </section>

        {/* 09. Data Integrity & Security */}
        <section className="space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono opacity-30">09</span>
            <h2 className="text-lg font-bold tracking-tight">Data Integrity & Security</h2>
          </div>
          
          <div className="space-y-4 pl-8 border-l border-zed-border">
            <ul className="text-sm text-zed-muted space-y-6">
              <li className="flex gap-6">
                <span className="text-zed-accent font-mono text-xs font-bold uppercase shrink-0">Shield</span>
                <p className="text-[13px]"><strong>Read-Only Access:</strong> GitNet is built as a non-destructive browser. It cannot modify history, delete branches, or perform destructive operations.</p>
              </li>
              <li className="flex gap-6 pt-4 border-t border-zed-border/50">
                <span className="text-zed-accent font-mono text-xs font-bold uppercase shrink-0">Local</span>
                <p className="text-[13px]"><strong>Offline First:</strong> All operations are performed against your local binary. Repository metadata never leaves your machine.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* 10. Effective Visualization Techniques */}
        <section className="space-y-8 pb-12">
          <div className="flex items-baseline gap-4">
            <span className="text-xs font-mono opacity-30">10</span>
            <h2 className="text-lg font-bold tracking-tight">Effective Visualization Techniques</h2>
          </div>
          
          <div className="space-y-10 pl-8 border-l border-zed-border">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zed-text">Tracing Feature Lifecycle</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                To understand how a feature evolved, find its merge commit (the diamond node) and hover over it. Use <span className="text-zed-text font-medium">Linear Focus</span> to trace the dashed line back to the feature's first commit. This eliminates the noise of parallel work and shows you exactly what was changed for that specific task.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zed-text">Assessing Codebase Stability</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                Navigate to <span className="text-zed-text font-medium">Insights</span> to identify your Hotspots. Then, search for those specific file paths in the Graph. If a file is a hotspot and you see a high density of <span className="text-commit-fix">fix</span> commits, it indicates a high-risk area that may require a deeper refactor rather than more patches.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zed-text">Propagational Analysis</h3>
              <p className="text-sm text-zed-muted leading-relaxed">
                When inspecting a bug fix, use the <span className="text-zed-text font-medium">Commit Metadata Context</span> in the sidebar. Check the "Merged / Contains" section to see if that fix has been incorporated into your <code className="bg-zed-element px-1 rounded font-mono">production</code> or <code className="bg-zed-element px-1 rounded font-mono">release</code> branches yet. This is the fastest way to verify if a patch is live across all environments.
              </p>
            </div>
          </div>
        </section>

        {/* Colophon */}
        <footer className="pt-20 text-[9px] font-mono uppercase tracking-[0.5em] opacity-20 text-center">
          GitNet Visualizer / Revision 2025.12.28
        </footer>
      </div>
    </div>
  );
};
