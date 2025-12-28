# GitNet — Main Spine Git Visualizer

GitNet is a high-performance desktop Git visualizer that maps the Directed Acyclic Graph (DAG) of a repository onto a stable, multi-lane grid system. Designed for architectural clarity, it helps developers navigate complex branch hierarchies and merge histories without visual noise.

## ✨ Key Features

### 🌲 Main Spine Architecture
- **Lane-Stable Layout**: Automatically organizes branches into persistent vertical lanes, keeping the project spine (main/master) anchored to the leftmost track for easy reference.
- **Semantic Classification**: Instantly identify commit intent (feat, fix, refactor) through standardized color encoding based on Conventional Commits.
- **Structural Node Shapes**: Distinguish between standard commits (circles), merge operations (diamonds), and reverts/stashes (squares) at a glance.

### ⚡ The Focus Engine
- **Linear Lineage Highlighting**: Hover over any commit to trigger a recursive trace. GitNet dims irrelevant paths and highlights the exact ancestors and descendants of that node.
- **Asynchronous Diffing**: Inspect changes with a high-performance diff viewer that retrieves data on-demand, ensuring the UI remains responsive even in massive repositories.

### 🔄 Real-Time Pipeline
- **Recursive Watcher**: A background service monitors your `.git` directory for state changes (commits, checkouts, rebases) and updates the UI instantly.
- **Interactive Checkout**: A dedicated tab for searching and switching branches safely within the app.

---

## 🎨 Visual Language

### Commit Semantics
GitNet uses a high-contrast palette to categorize your work:
- 🟢 **Green**: Features (`feat`) — New logic and capabilities.
- 🔴 **Red**: Bug Fixes (`fix`) — Patches and stability updates.
- 🟡 **Yellow**: Refactor — Code cleanup without functional changes.
- 🔵 **Blue**: Docs — Documentation-only updates.
- ⚪ **Gray**: Others — Chores, build scripts, and maintenance.

### Highlighting Context
When a commit is selected, the sidebar provides deep context:
- **● Branch Tip**: The commit is the current head of that branch.
- **Inferred Original**: The primary branch where the work was authored.
- **Merged / Contains**: Every other branch that has since incorporated this commit.

---

## 🚀 Workflow

1. **Open**: Select a local repository folder from the Welcome screen.
2. **Trace**: Hover over nodes to isolate the "story" of a specific feature.
3. **Analyze**: Use the **Insights** view to identify "Hot Files" (high-churn areas) and contributor impact.
4. **Switch**: Click the Git icon in the status bar to switch branches via the Checkout tab.
5. **Sync**: Use the Sync button or `Cmd/Ctrl + R` if external changes aren't reflected immediately.

---

## ⌨️ Global Shortcuts

| Action | Key |
| :--- | :--- |
| **Refresh All Data** | `Cmd/Ctrl + R` |
| **Open Repository** | `Cmd/Ctrl + O` |
| **Close Sidebar/Panels** | `Esc` |
| **Snap to HEAD** | Floating Action Button |

---

## 🛠️ Technical Stack

- **Shell**: Electron (Cross-platform Desktop)
- **Frontend**: React + TypeScript
- **Visualization**: D3.js (SVG Graph Engine)
- **Styling**: Tailwind CSS (Zed-inspired palette)
- **Runtime**: Bun

---
*GitNet — visualize the spine of your project.*
