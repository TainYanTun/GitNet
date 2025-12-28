# GitNet Project Requirements & Specification

GitNet is a high-performance, desktop-based Git visualization tool designed to provide a "Railway-style" commit graph. It focuses on clarity, speed, and deep architectural insights for developers.

## 1. Core Functional Requirements

### 1.1 Repository Management
- **Selection:** Users can open any local folder containing a valid `.git` directory via a native file picker or CLI argument.
- **Recent Repositories:** The application maintains a list of the 10 most recently opened repositories for quick access.
- **Real-time Watching:** Instant UI updates when the repository state changes (e.g., new commits, branch switching, or stashing) using file system listeners.

### 1.2 Interactive Commit Graph
- **Visualization:** A D3.js powered SVG graph using a dynamic lane-assignment algorithm.
- **Semantic Coloring:** Branch colors are assigned based on name patterns (e.g., `feature/*`, `hotfix/*`) or stable hash-based generation.
- **Node Interaction:** Clicking a commit node opens a detailed view; hovering highlights the lineage (ancestors and descendants).
- **Search:** Filter commits by message, author, hash, or tags (using `tag:` prefix).

### 1.3 Commit Details & Diffing
- **Metadata:** Display author (with Gravatar integration), timestamp, full message, parent hashes, and associated branches/tags.
- **File Tree:** A navigable tree view of all files modified in a specific commit.
- **Diff Viewer:** High-performance viewing of changes per file, retrieved asynchronously from the Git CLI.

### 1.4 Repository Insights
- **Contributor Stats:** Analysis of project activity per author, including commit counts, additions/deletions, and chronological activity heatmaps.
- **Hotspots:** Identification of "Hot Files" based on modification frequency across the entire history.
- **Stash Management:** Visual gallery and list of Git stashes.

## 2. Technical Architecture

### 2.1 Stack
- **Framework:** Electron (Main/Renderer/Preload architecture).
- **Frontend:** React with TypeScript and Vite.
- **Styling:** Tailwind CSS with a "Zed-inspired" UI palette (One Dark/Light).
- **Graph Engine:** D3.js.
- **Data Source:** Native Git CLI via Node.js `child_process`.

### 2.2 Performance Standards
- **Asynchronous Execution:** All Git operations must use non-blocking `spawn` calls to ensure the UI remains responsive (60fps) even during heavy I/O.
- **Data Buffering:** Main process handles Git output streams to prevent memory overflows on large logs.

### 2.3 Security (Hardened)
- **Context Isolation:** Enabled to bridge the gap between renderer and Node.js securely.
- **Content Security Policy (CSP):** Strict policy preventing unauthorized script execution and restricting data sources.
- **Shell Injection Protection:** Git commands must use array-based arguments (no shell interpolation) to prevent malicious input execution.
- **Permission Lockdown:** All unnecessary Electron permissions (Camera, Mic, Notifications) are denied by default.

## 3. UI/UX Requirements
- **Theme Support:** Native Light, Dark, and System modes.
- **Typography:** High-legibility monospaced fonts for Git hashes and code paths.
- **Scrollbar UI:** Modern, thin, floating scrollbars that adapt to the active theme.
- **Persistence:** Application remembers window size, position, and recent repositories across sessions.

## 4. Deployment & Distribution
- **Build System:** `electron-builder` for multi-platform packaging.
- **Git Requirement:** The app must verify Git installation on startup and provide a user-friendly error if missing.
- **Assets:** Platform-specific icons (`.icns`, `.ico`) are required for professional OS integration.
