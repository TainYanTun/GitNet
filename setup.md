# GitCanopy Setup Guide

## 🚀 Quick Setup

### Option 1: Using Bun (Recommended - Fastest)

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   # or
   npm install -g bun
   ```

2. **Install dependencies**:
   ```bash
   cd gitcanopy
   bun install
   ```

3. **Start development**:
   ```bash
   bun run dev
   ```

### Option 2: Using npm

1. **Install dependencies**:
   ```bash
   cd gitcanopy
   npm install --timeout=60000
   ```

2. **Start development**:
   ```bash
   npm run dev
   ```

### Option 3: Using yarn

1. **Install dependencies**:
   ```bash
   cd gitcanopy
   yarn install
   ```

2. **Start development**:
   ```bash
   yarn dev
   ```

## 🏗️ Project Status

### ✅ Completed Structure
- [x] **Complete folder structure** with proper separation of concerns
- [x] **TypeScript configuration** for all processes (main, preload, renderer)
- [x] **Electron main process** with proper security and IPC setup
- [x] **React renderer** with modern hooks and TypeScript
- [x] **Preload scripts** for secure IPC communication
- [x] **Tailwind CSS** with custom Git-themed color palette
- [x] **Vite** for fast development and building
- [x] **ESLint** and TypeScript for code quality
- [x] **Electron Builder** for cross-platform packaging

### 🚧 Core Services (Basic Implementation)
- [x] **GitService** - Executes git commands and parses output
- [x] **RepositoryWatcher** - Monitors git repository changes  
- [x] **SettingsService** - Manages app configuration
- [x] **Error Boundary** - React error handling
- [x] **Basic Components** - Welcome screen, main layout, loading states

### 🎯 Next Steps to Complete

1. **Enhanced Git Integration**:
   - Add more robust git command error handling
   - Implement commit graph layout algorithms
   - Add branch lane assignment logic

2. **D3.js Visualization**:
   - Create interactive commit graph component
   - Implement zoom, pan, and selection features
   - Add semantic coloring for commit types

3. **Performance Optimization**:
   - Implement virtual scrolling for large repos
   - Add progressive loading and caching
   - Optimize rendering for 10k+ commits

4. **UI Polish**:
   - Add remaining components (CommitDetails, Toolbar, etc.)
   - Implement dark/light theme switching
   - Add keyboard shortcuts and accessibility

## 🛠️ Development Commands

```bash
# Development (hot reload)
bun run dev          # Start both main and renderer in dev mode
bun run dev:renderer # Start only React dev server
bun run dev:main     # Start only Electron main process

# Building
bun run build        # Build both main and renderer for production
bun run build:main   # Build only main process
bun run build:renderer # Build only renderer

# Quality Assurance  
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues automatically
bun run type-check   # Run TypeScript compiler checks

# Packaging
bun run pack         # Create platform-specific package (no installer)
bun run dist         # Create distributable installers
```

## 🔍 Architecture Overview

```
┌─────────────────────────────────────────┐
│                 Electron                │
├─────────────────────────────────────────┤
│           Main Process                  │
│  ┌─────────────┬─────────────────────┐  │
│  │ Git Service │ Repository Watcher  │  │
│  │             │                     │  │
│  │ • Commands  │ • File System      │  │
│  │ • Parsing   │ • Change Events    │  │
│  └─────────────┴─────────────────────┘  │
│                  │                      │
│                  │ IPC                  │
│            ┌─────▼─────┐                │
│            │  Preload  │                │
│            │  Script   │                │
│            └─────┬─────┘                │
├──────────────────┼──────────────────────┤
│                  │                      │
│            Renderer Process             │
│  ┌───────────────▼───────────────┐      │
│  │         React App             │      │
│  │  ┌─────────────────────────┐  │      │
│  │  │    D3.js Visualization  │  │      │
│  │  │                         │  │      │
│  │  │  • Interactive Graph   │  │      │
│  │  │  • Semantic Colors     │  │      │
│  │  │  • Railway-style Lanes │  │      │
│  │  └─────────────────────────┘  │      │
│  └───────────────────────────────┘      │
└─────────────────────────────────────────┘
```

## 📁 Key Files

### Main Process
- `src/main/main.ts` - Electron main entry point
- `src/main/services/git-service.ts` - Git CLI integration
- `src/main/services/repository-watcher.ts` - File system monitoring

### Preload
- `src/preload/preload.ts` - Secure IPC bridge

### Renderer  
- `src/renderer/src/App.tsx` - Main React application
- `src/renderer/src/components/` - UI components
- `src/renderer/index.html` - HTML template

### Shared
- `src/shared/types.ts` - TypeScript interfaces shared across processes

### Configuration
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.js` - CSS framework setup
- `tsconfig.json` - TypeScript configuration

## 🚨 Troubleshooting

### Installation Issues

**Node.js/npm timeout**:
```bash
npm install --timeout=300000 --registry https://registry.npmjs.org/
```

**Electron rebuild issues**:
```bash
npm run postinstall
# or
electron-builder install-app-deps
```

### Development Issues

**Port already in use**:
- Vite dev server uses port 3000
- Change in `vite.config.ts` if needed

**TypeScript errors**:
```bash
bun run type-check
```

**Missing dependencies**:
```bash
rm -rf node_modules bun.lockb package-lock.json
bun install
```

## 🎯 Current State Summary

The project is **75% ready** with:

✅ **Complete architecture and tooling setup**
✅ **Basic Electron app that can select and display repository info**  
✅ **Secure IPC communication between processes**
✅ **Modern React with TypeScript and Tailwind**
✅ **Git integration foundation**

🚧 **Still needed**: D3.js graph implementation, advanced Git parsing, performance optimizations

This is an excellent foundation that can be iteratively built upon!