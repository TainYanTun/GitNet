# GitCanopy

**A high-performance Git client and visualizer that reveals the architectural spine of your repository.**

GitCanopy transforms complex Git histories into a stable, lane-based graph that keeps your main branch anchored and your merge patterns clear. Built for developers who need architectural clarity and a hyper-minimalist, lightning-fast staging workflow.

---

## Core Capabilities

### 🚆 Visualization Engine
- **Main Spine Architecture:** Vertical lanes keep your primary branch locked to the left, providing a stable reference point for navigation.
- **Semantic Classification:** Commits are color-coded by intent (Features, Fixes, Docs) and geometry (Merges, Reverts, Stashes).
- **Focus Mode:** Hover over any node to trace recursive lineage, isolating the "story" of a feature while dimming unrelated noise.

### ✍️ Professional Workflow
- **Virtualized Performance:** Scroll through 10,000+ commits or massive diffs at 60FPS using industry-leading windowing techniques.
- **Uncommitted Changes:** A dedicated view for your working directory status, allowing you to review modifications in a high-fidelity unified diff viewer.
- **Stage & Commit:** A tightly integrated, hyper-minimalist interface for staging files and authoring commits.
- **Push & Sync:** One-click synchronization with remote repositories.

### 📊 Repository Insights
- **Team Metrics:** Analyze contributor impact and activity trends over time.
- **File Hotspots:** Identify high-churn files and potential architectural bottlenecks.
- **Stash Gallery:** Visual management of your Git stashes.

---

## Technical Foundation

- **Environment:** Electron (isolated renderer, safe IPC)
- **Frontend:** React + TypeScript (Virtualized rendering)
- **Graph Engine:** D3.js (Background Web Worker layout)
- **Styling:** Tailwind CSS (Zed-inspired hyper-minimalist theme)
- **Engine:** Safe `spawn` Git binary interaction with 10MB safety buffers.

---

## Keyboard Shortcuts

| Action | Binding |
|--------|---------|
| Refresh / Sync | `⌘ + R` |
| Open Repository | `⌘ + O` |
| Close Panels | `Esc` |
| Commit | `⌘ + Enter` (in Changes view) |

---

**GitCanopy** — navigate and author the structure of your project's history.