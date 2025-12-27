# GitNet - Git Commit Graph Visualizer

A Railway-style desktop Git visualizer that displays commit history as an interactive graph with semantic coloring and clear merge representation.

This is a test

![GitNet Screenshot](assets/screenshot.png)

## 🌟 Features

- **Interactive Commit Graph**: Railway-style visualization with semantic coloring
- **Conventional Commits Support**: Automatic classification of commit types (feat, fix, docs, etc.)
- **Branch Lane Management**: Clear visual separation of different branches
- **Merge Visualization**: Diamond nodes for merge commits with proper lane routing
- **Live Sync**: Auto-refresh when repository changes detected
- **Performance Optimized**: Handles repositories with 10k+ commits
- **Cross-Platform**: Works on macOS, Windows, and Linux
- **Offline First**: No internet connection required

## 🛠️ Tech Stack

- **Electron** - Desktop application framework
- **React** - UI library with TypeScript
- **D3.js** - Interactive graph visualization
- **Tailwind CSS** - Utility-first styling
- **Node.js** - Git CLI integration
- **TypeScript** - Type safety and better DX

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn**
- **Git** installed and accessible from command line

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd gitnet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm run dist
   ```

## 📁 Project Structure

```
gitnet/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   ├── utils.ts       # Utility functions
│   │   └── services/      # Backend services
│   │       ├── git-service.ts
│   │       ├── repository-watcher.ts
│   │       └── settings-service.ts
│   ├── preload/           # Preload scripts
│   │   └── preload.ts     # IPC bridge
│   ├── renderer/          # React application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── App.tsx
│   │   └── index.html
│   └── shared/            # Shared types and utilities
│       └── types.ts
├── assets/                # Static assets
├── dist/                  # Built files
├── release/               # Packaged applications
└── config files...
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development with hot reload
- `npm run build` - Build for production
- `npm run dist` - Create distributable packages
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript checks

### Architecture

```
┌─────────────────┐
│ Electron Main   │
│ Process         │
├─────────────────┤
│ • Git CLI       │
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
│ • D3 Visualization│
│ • State Management│
└───────────────────┘
```

### Key Components

#### Main Process Services

- **GitService**: Executes Git commands and parses output
- **RepositoryWatcher**: Monitors repository changes using filesystem events
- **SettingsService**: Manages application settings and preferences

#### Renderer Components

- **WelcomeScreen**: Initial repository selection interface
- **MainLayout**: Primary application layout with panels
- **CommitGraph**: D3.js powered interactive visualization
- **RepositoryInfo**: Shows current repository details
- **CommitDetails**: Displays commit information and metadata

### Git Commands Used

```bash
# Get commit history
git log --all --pretty=format:'%H|%P|%an|%ae|%ct|%s'

# Get branch information  
git branch --format='%(refname:short)|%(objectname)'

# Check if directory is a Git repository
git rev-parse --is-inside-work-tree

# Get current HEAD
git symbolic-ref --short HEAD
```

## 🎨 Commit Type Colors

The application uses a color-blind friendly palette for commit classification:

- **feat** (🟢) - New features
- **fix** (🔴) - Bug fixes  
- **docs** (🔵) - Documentation changes
- **style** (🟣) - Code style changes
- **refactor** (🟡) - Code refactoring
- **perf** (🔵) - Performance improvements
- **test** (🟢) - Test additions/changes
- **chore** (⚪) - Maintenance tasks
- **other** (⚪) - Unclassified commits

## 📊 Performance Considerations

### Large Repository Handling

- **Virtual Scrolling**: Only renders visible commits
- **Lazy Loading**: Loads commits in batches
- **Efficient Diffing**: Minimizes re-renders using React optimization
- **D3 Optimization**: Uses canvas fallback for very large graphs

### Memory Management

- Commits are loaded in pages of 1000
- Old commit data is garbage collected when scrolling
- Image assets are lazy loaded

## 🛡️ Security

- **Context Isolation**: Renderer process is sandboxed
- **Preload Scripts**: Secure IPC communication bridge  
- **No Node.js in Renderer**: Direct Node.js access disabled
- **CSP Headers**: Content Security Policy enforcement

## 🔄 Live Sync

GitNet monitors these files for changes:

- `.git/HEAD` - Branch changes
- `.git/refs/heads/*` - Branch updates
- `.git/index` - Staging changes (future feature)

## ⚙️ Configuration

Settings are stored in the OS-specific user data directory:

- **macOS**: `~/Library/Application Support/GitNet/`
- **Windows**: `%APPDATA%/GitNet/`
- **Linux**: `~/.config/GitNet/`

### Available Settings

```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  maxCommits: number;
  autoRefresh: boolean;
  refreshInterval: number;
  showAuthor: boolean;
  showTimestamp: boolean;
  compactMode: boolean;
  colorBlindMode: boolean;
}
```

## 🐛 Debugging

### Development Tools

1. **Electron DevTools**: `Ctrl/Cmd + Shift + I`
2. **Main Process Debugging**: `--inspect=5858` flag
3. **Console Logging**: Available in both processes

### Common Issues

1. **Git not found**: Ensure Git is in system PATH
2. **Permission errors**: Check repository read permissions
3. **Large repo performance**: Enable virtual scrolling in settings

## 🏗️ Building

### Development Build

```bash
npm run build
```

### Production Packages

```bash
# All platforms (requires platform-specific environments)
npm run dist

# Specific platform
npm run dist -- --mac
npm run dist -- --win  
npm run dist -- --linux
```

### Build Outputs

- **macOS**: `.dmg` installer
- **Windows**: `.exe` installer (NSIS)
- **Linux**: `.AppImage` portable executable

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test changes
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by GitKraken, SourceTree, and other Git visualization tools
- Built with the amazing Electron and React ecosystems
- D3.js for powerful graph visualization capabilities
- Tailwind CSS for rapid UI development

## 🔗 Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [D3.js Documentation](https://d3js.org/)
- [Git Documentation](https://git-scm.com/docs)
- [Conventional Commits](https://conventionalcommits.org/)

---

**Made with ❤️ for the developer community**
