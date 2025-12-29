# GitCanopy

**A high-performance Git visualizer that reveals the architectural spine of your repository.**

GitCanopy transforms complex Git histories into a stable, lane-based graph that keeps your main branch anchored and your merge patterns clear. Built for developers who need to understand the structural evolution of their codebase without visual clutter.

---

## Core Capabilities

**Main Spine Architecture**  
Automatically organizes commits into persistent vertical lanes, with your primary branch (main/master) locked to the leftmost position. This creates a stable reference point as you navigate through branch hierarchies and merge histories.

**Semantic Classification**  
Commits are color-coded by intent using Conventional Commits patterns:
- Green → Features (`feat`)
- Red → Bug fixes (`fix`)
- Yellow → Refactoring
- Blue → Documentation
- Gray → Maintenance

Node shapes convey structure: circles for standard commits, diamonds for merges, squares for reverts and stashes.

**Focus Engine**  
Hover over any commit to trace its lineage. GitCanopy recursively highlights ancestors and descendants while dimming unrelated paths, revealing the exact journey of a feature or fix through your codebase.

**Real-Time Sync**  
A background watcher monitors your `.git` directory and updates the visualization automatically when you commit, checkout, or rebase.

---

## Visual Language

The graph uses high-contrast colors against a dark background to minimize eye strain during extended sessions. When you select a commit, the sidebar provides:

- Branch associations (where it originated, where it merged)
- File changes with on-demand diff viewing
- Author metadata and timestamp

The "Hot Files" panel identifies high-churn areas in your repository, helping you spot architectural pain points.

---

## Workflow

1. **Open** a local repository from the welcome screen
2. **Trace** commit paths by hovering over nodes
3. **Analyze** structural patterns in the Insights view
4. **Switch** branches via the Checkout tab (Git icon in status bar)
5. **Sync** manually with `Cmd/Ctrl + R` if needed

---

## Keyboard Shortcuts

| Action | Binding |
|--------|---------|
| Refresh repository | `Cmd/Ctrl + R` |
| Open repository | `Cmd/Ctrl + O` |
| Close panels | `Esc` |
| Jump to HEAD | Floating action button |

---

## Technical Foundation

- **Runtime**: Electron (cross-platform desktop)
- **Interface**: React + TypeScript
- **Graph engine**: D3.js with SVG rendering
- **Styling**: Tailwind CSS
- **Package manager**: Bun

---

**GitNet** — navigate the structure of your project's history.
