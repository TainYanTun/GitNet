# GitNet - Git Commit Graph Visualizer

A Railway-style desktop Git visualizer that displays commit history as an interactive graph with semantic coloring and clear merge representation.

## 🌟 Features

- **Interactive Commit Graph**: Railway-style visualization with semantic coloring using D3.js.
- **Commit Details**: View file changes, stats, and diffs for any commit.
- **Branch Management**: Clear visual separation of branches with "Main Spine" layout.
- **Conventional Commits Support**: Automatic classification of commit types (feat, fix, docs, etc.) with visual indicators.
- **Stash Visualization**: View stashed changes directly on the graph.
- **Repository Insights**:
    - **Hot Files**: Identify frequently changed files ("hotspots").
    - **Contributor Stats**: View activity and impact per contributor.
- **Search**: Filter commits by message, author, hash, or tags.
- **Live Sync**: Auto-refresh when repository changes are detected.
- **Cross-Platform**: Works on macOS, Windows, and Linux.

## 🛠️ Tech Stack

- **Electron** - Desktop application framework
- **React** - UI library with TypeScript
- **D3.js** - Interactive graph visualization
- **Tailwind CSS** - Utility-first styling
- **Bun** - Fast JavaScript runtime & package manager
- **TypeScript** - Type safety and better DX

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **Bun** (recommended) or **npm**
- **Git** installed and accessible from command line

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd gitnet
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start development:**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

4. **Build for production:**
   ```bash
   bun run build
   bun run dist
   # or
   npm run build
   npm run dist
   ```

## 📁 Project Structure

```
gitnet/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   ├── services/      # Backend services
│   │   │   ├── git-service.ts
│   │   │   ├── repository-watcher.ts
│   │   │   └── settings-service.ts
│   │   └── utils.ts
│   ├── preload/           # Preload scripts
│   │   └── preload.ts     # IPC bridge
│   ├── renderer/          # React application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── CommitGraph.tsx   # D3 Visualization
│   │   │   │   ├── CommitDetails.tsx # Detail view & Diffs
│   │   │   │   └── ...
│   │   │   ├── utils/
│   │   │   │   └── graph-layout.ts   # Graph layout engine
│   │   │   └── App.tsx
│   │   └── index.html
│   └── shared/            # Shared types and utilities
│       └── types.ts
├── assets/                # Static assets
├── dist/                  # Built files
├── release/               # Packaged applications
└── ...
```

## 🔧 Development

### Available Scripts

- `bun run dev` - Start development with hot reload
- `bun run build` - Build for production
- `bun run dist` - Create distributable packages
- `bun run lint` - Run ESLint and Stylelint
- `bun run type-check` - Run TypeScript checks

### Architecture

```
┌─────────────────┐
│ Electron Main   │
│ Process         │
├─────────────────┤
│ • Git CLI (Exec)│
│ • File Watcher  │
│ • IPC Handlers  │
└─────────┬───────┘
          │
    ┌─────▼─────┐
    │ Preload   │
    │ Script    │
    └─────┬─────┘
          │
┌─────────▼─────────┐
│ React Renderer    │
├───────────────────┤
│ • UI Components   │
│ • D3 SVG Graph    │
│ • React State     │
└───────────────────┘
```

### Key Components

#### Main Process Services

- **GitService**: Executes raw Git commands (log, show, diff) and parses output into structured data.
- **RepositoryWatcher**: Monitors file system events in the repository to trigger auto-refreshes.
- **SettingsService**: Manages persistent application settings.

#### Renderer Components

- **CommitGraph**: Core component handling the D3.js visualization, semantic rendering, and interactions.
- **MainLayout**: Orchestrates the split-pane view (Graph, Details, Sidebar).
- **HotFiles**: Visualizes frequently changed files.
- **Contributors**: Displays contributor statistics.

## 🎨 Commit Type Colors

The application uses a semantic color palette for commit classification:

- **feat** (🟢 Green) - New features
- **fix** (🔴 Red) - Bug fixes
- **docs** (🔵 Blue) - Documentation
- **style** (🟣 Purple) - Styling
- **refactor** (🟡 Yellow) - Refactoring
- **merge** (💎 Diamond Shape) - Merge commits
- **stash** (📦 Box Shape) - Stashed changes

## ⚙️ Configuration

Settings are stored in `settings.json` in the user data directory:

```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  maxCommits: number;      // Limit initial load (default: 1000)
  autoRefresh: boolean;    // Enable/disable file watching
  refreshInterval: number; // Debounce interval for refresh
  showAuthor: boolean;     // Toggle author avatars in graph
  showTimestamp: boolean;
  compactMode: boolean;    // Tighter spacing in graph
  colorBlindMode: boolean; // High contrast colors
}
```

## 🛡️ Security

- **Context Isolation**: Renderer process is sandboxed and isolated.
- **Preload Scripts**: Only specific, safe API methods are exposed via `window.gitnetAPI`.
- **No Node.js in Renderer**: Direct Node.js access is disabled for security.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes (following Conventional Commits!)
4. Push to branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
