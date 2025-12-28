# GitNet — The Railway Git Visualizer

GitNet is a high-performance desktop Git visualizer that transforms your commit history into an interactive, "Railway-style" graph. Designed for clarity and speed, it helps developers navigate complex branch hierarchies and merge histories with ease.

## ✨ Key Features

### 🛤️ Railway Commit Graph
- **Intelligent Layout**: Automatically organizes branches into stable "lanes" for a clean, non-overlapping view.
- **Semantic Coloring**: Instantly identify commit types (feat, fix, refactor) through a standardized color palette.
- **Lineage Highlighting**: Hover over any commit to see its full ancestry and descendant path.
- **Dynamic Zoom**: Smoothly navigate through repositories with 10,000+ commits using D3-powered rendering.

### 🔄 Real-Time Sync & Manual Refresh
- **Auto-Update**: Built-in file watcher monitors your `.git` directory and updates the UI the moment you commit or switch branches externally.
- **Sync Button**: A dedicated status bar button and shortcut (`Cmd/Ctrl + R`) to force a full data refresh whenever needed.

### 🔀 Interactive Checkout Tab
- **Dedicated View**: Access the branch switcher via the Git icon in the bottom status bar.
- **Search & Filter**: Quickly find local or remote branches with real-time fuzzy search.
- **Active Indicators**: See exactly where you are with clear "Active" badges and short-hash references.

### 🔍 Deep Repository Insights
- **Commit Details**: View full messages, parent links, and precise file-level diffs.
- **Hotspots**: Identify "Hot Files" that are modified most frequently in your project.
- **Contributors**: Visual analysis of team activity and chronological engagement.
- **Stash Gallery**: Browse your Git stashes in a dedicated visual gallery.

---

## 🎨 Understanding the Visualization

### Commit Types
GitNet automatically classifies commits based on [Conventional Commits](https://www.conventionalcommits.org/):
- 🟢 **Green**: Features (`feat`)
- 🔴 **Red**: Bug Fixes (`fix`)
- 🔵 **Blue**: Documentation (`docs`)
- 🟣 **Purple**: UI/Style updates (`style`)
- 🟡 **Yellow**: Refactoring (`refactor`)
- ⚪ **Gray**: Maintenance (`chore`/`other`)

### Node Shapes
- ● **Circle**: Standard commit.
- ◆ **Diamond**: Merge commit (contains 2+ parents).
- ◼ **Square**: Revert or Stash commit.

---

## 🚀 How to Use

1. **Open a Repository**: Select any local folder containing a `.git` directory.
2. **Explore**: Scroll or drag the graph to navigate history. Use the search bar to find specific hashes or messages.
3. **Inspect**: Click a node to open the side panel for diffs and file statistics.
4. **Switch**: Use the **Checkout Tab** (bottom Git icon) to jump between branches.
5. **Sync**: If you perform Git actions in your terminal, GitNet will usually update instantly. If not, press the **Sync** icon.

---

## ⌨️ Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **Refresh Data** | `Cmd/Ctrl + R` |
| **Open Repository** | `Cmd/Ctrl + O` |
| **Close Sidebar/Panel** | `Esc` |
| **Toggle Theme** | Click Sun/Moon Icon |

---

## 🛠️ Technical Overview

GitNet is built for performance using a modern desktop stack:
- **Core**: Electron (Desktop Shell)
- **Frontend**: React + TypeScript
- **Visualization**: D3.js (SVG Graph Engine)
- **Styling**: Tailwind CSS (One Dark/Light palette)
- **Runtime**: Bun (Fast JS execution)

---
*GitNet — visualize your progress.*