<div align="center">

# GitCanopy: Git Visulization Client designed for Professional Engineers

Transform complex commit histories into stable, readable graphs with a hyper-minimalist, lightning-fast workflow.

[![Version](https://img.shields.io/badge/version-1.0.0_Stable-1f2937?style=flat&logo=git)](https://github.com/TainYanTun/GitCanopy/releases)
[![Build](https://img.shields.io/badge/build-passing-success?style=flat)](https://github.com/TainYanTun/GitCanopy/actions)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-red?style=flat)](https://github.com/TainYanTun/GitCanopy)

**The Architectural Spine of the Repository**


[Features](#-features) • [Download](#-download) • [Usage](#-usage) • [Roadmap](#-roadmap) • [Contributing](#-contributing)

<img src="src/renderer/public/interface.png" width="850" alt="GitCanopy Interface" />

</div>

---

## ✨ Features

- **Visualization Engine:** Lane-persistent commit graphs with semantic coloring and lineage tracing.
- **Professional Performance:** 60FPS virtualized rendering and background worker-powered layouts.
- **Seamless Workflow:** Atomic staging, high-fidelity diffs, and integrated remote synchronization.
- **Deep Insights:** Contributor metrics, file hotspot analysis, and a visual stash gallery.

---

## 📦 Download

GitCanopy is an open-source project hosted on GitHub. You can find the latest installers for macOS, Windows, and Linux on our **Releases** page:

👉 **[Download GitCanopy from GitHub](https://github.com/TainYanTun/GitCanopy/releases)**

> **Note for macOS users:** Since the app is currently unsigned, you will need to **Right-Click > Open** the first time you launch it to bypass the security verification.

### 🛠️ Development Setup
For developers looking to build from source or contribute, please refer to the [Setup Guide](setup.md).

---

## 🎮 Usage

### Opening Your First Repository

<table>
<tr>
<td width="50%">

**Method 1: Welcome Screen**
1. Launch GitCanopy
2. Click **Open Repository**
3. Navigate to any folder with a `.git` directory

</td>
<td width="50%">

**Method 2: Keyboard Shortcut**
- macOS: `⌘ + O`
- Windows/Linux: `Ctrl + O`

</td>
</tr>
</table>

### 🧭 Interface Navigation

| View | Description |
|------|-------------|
| **Graph View** | Primary visual DAG for history navigation—the heart of GitCanopy |
| **Commit History** | Searchable, chronological list of all commits with filters |
| **Changes View** | Review, stage, and commit local modifications |
| **Team Insights** | Analytics dashboard for contributor activity |
| **Stash Manager** | Visual gallery of saved work-in-progress states |

> **Pro Tip:** For a comprehensive feature breakdown and advanced workflows, check out our [Full Documentation](documentation.md)

---

## ⌨️ Keyboard Shortcuts

### Essential Commands

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Open Repository | `⌘ + O` | `Ctrl + O` |
| Refresh / Sync | `⌘ + R` | `Ctrl + R` |
| Commit Changes | `⌘ + Enter` | `Ctrl + Enter` |
| Search Commits | `⌘ + F` | `Ctrl + F` |
| Close Panel | `Esc` | `Esc` |
| Toggle Fullscreen | `⌃ + ⌘ + F` | `F11` |

---

## 🏗️ Technical Architecture

GitCanopy leverages a modern, type-safe stack designed for security, performance, and maintainability.

```mermaid
graph TD
    A[Electron Main Process] -->|Secure IPC| B(Preload Script)
    B -->|Context Bridge| C[React Renderer]
    C -->|Worker Thread| D[D3.js Graph Engine]
    A -->|Safe Spawn| E[Git Binary]
    A -->|File Watch| F[File System]
    
    style A fill:#1f2937,stroke:#3b82f6,stroke-width:2px,color:#fff
    style C fill:#0891b2,stroke:#06b6d4,stroke-width:2px,color:#fff
    style D fill:#7c3aed,stroke:#a78bfa,stroke-width:2px,color:#fff
    style E fill:#059669,stroke:#10b981,stroke-width:2px,color:#fff
```

### Technology Stack

<table>
<tr>
<td><strong>Runtime</strong></td>
<td>Electron with isolated renderer and secure IPC</td>
</tr>
<tr>
<td><strong>Frontend</strong></td>
<td>React + TypeScript + Tailwind CSS (Zed-inspired theme)</td>
</tr>
<tr>
<td><strong>Visualization</strong></td>
<td>D3.js with Web Worker computation</td>
</tr>
<tr>
<td><strong>State Management</strong></td>
<td>Event-driven architecture with React Hooks</td>
</tr>
<tr>
<td><strong>Git Integration</strong></td>
<td>Native binary interaction with memory-safe buffers</td>
</tr>
</table>

---

## 🗺️ Roadmap

- [ ] **Visual Interactive Rebase:** Drag-and-drop history management and rewriting.
- [ ] **Conflict Resolution UI:** Advanced tools for solving complex merges.
- [ ] **Ecosystem Integration:** First-class support for GitHub, GitLab, and Bitbucket.
- [ ] **Extensibility:** Custom themes and commit classification plugin system.

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug reports, feature requests, or code contributions, every bit helps make GitCanopy better.

### How to Contribute

1. **Fork** the repository
2. **Create** your feature branch  
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes  
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** to the branch  
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style (TypeScript + ESLint)
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

### Priority Areas

Check our [Roadmap](#-roadmap) for current development priorities. Issues labeled `good-first-issue` are great entry points for new contributors.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

```
MIT License - feel free to use GitCanopy in your projects,
modify it, and distribute it as you see fit.
```

---

<div align="center">

{ [Report Bug](https://github.com/TainYanTun/GitCanopy/issues/new?template=bug_report.md) • [Request Feature](https://github.com/TainYanTun/GitCanopy/issues/new?template=feature_request.md) • [Documentation](documentation.md) }

</div>
