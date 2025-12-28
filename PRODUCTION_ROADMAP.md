# GitNet: Production Readiness Roadmap

This document outlines the critical architectural, performance, and security enhancements required to transition GitNet from a functional prototype to a production-grade desktop application.

---

## 1. Performance & Scalability (The 10k+ Challenge)
Current SVG-based rendering will hit performance bottlenecks in large repositories.

- [ ] **Canvas-Based Graph Rendering:** Transition the D3 rendering engine from SVG to HTML5 Canvas. SVG nodes become a memory burden after ~2,000 commits; Canvas can handle 50,000+ nodes with 60FPS fluid motion.
- [ ] **Viewport Virtualization:** Only compute and draw the section of the graph currently visible to the user.
- [ ] **Data Streaming:** Modify the `GitService` to stream commits in chunks (e.g., 500 at a time) rather than loading the entire history into the renderer's memory at once.
- [ ] **Worker Threads:** Offload the heavy "Main Spine" layout calculations to a Web Worker to prevent UI freezes during initial data processing.

## 2. Robustness & Git Edge Cases
Production environments feature complex Git states that must be handled gracefully.

- [ ] **State Awareness:** Add UI indicators for special Git states:
    - Rebase in progress (identifying the "onto" branch).
    - Merge conflicts (highlighting unmerged files).
    - Detached HEAD state.
- [ ] **Binary & Large File Handling:** Implement a guard for diffs. If a file is binary or exceeds 1MB, show a "Preview unavailable" message instead of attempting to render the text.
- [ ] **Git Submodules:** Ability to detect submodules and "drill down" into their specific history.

## 3. Distribution & Trust
Users must be able to install and update the app safely.

- [ ] **Code Signing & Notarization:** 
    - **macOS:** Obtain an Apple Developer certificate and set up notarization to avoid "Unidentified Developer" blocks.
    - **Windows:** Sign the executable with a code-signing certificate to prevent "SmartScreen" warnings.
- [ ] **Auto-Updater:** Integrate `electron-updater` to handle background downloads and atomic updates.
- [ ] **Multi-Arch Builds:** Ensure the CI pipeline builds for both Intel (`x64`) and Apple Silicon (`arm64`) specifically.

## 4. Hardened Security
Protecting the user's system and data.

- [ ] **Strict Content Security Policy (CSP):** Implement a CSP that blocks all inline scripts and restricts connections to known Gravatar/Localhost endpoints.
- [ ] **Secure IPC:** Audit all IPC handlers to ensure no shell commands can be injected via malicious repository metadata (e.g., a commit message containing backticks).
- [ ] **OAuth (Optional):** If GitHub/GitLab integrations are added, use secure system keychain storage for tokens.

## 5. Advanced Developer Tooling
Features required for day-to-day enterprise use.

- [x] **Git Command Console:** A small "output" log showing the exact Git CLI commands the app is running for transparency.
- [ ] **Configurable Themes:** Allow users to import custom VS Code-style theme files (`.json`).

## 6. Observability
Knowing why the app failed on a user's machine.

- [ ] **Local Logging Pipeline:** Implement a rotating log file system in the user's data directory.
- [ ] **Crash Reporting:** Integration with a service like Sentry or OpenTelemetry to capture main-process crashes without manual user reporting.
- [ ] **Analytical Health Check:** A built-in "Diagnostics" tab to check Git version compatibility and file-watcher permissions.

---

## Current Status: Prototype
| Metric | Status | Note |
| :--- | :--- | :--- |
| **Logic** | ✅ Excellent | "Main Spine" algorithm is reliable. |
| **Sync** | ✅ Great | Recursive watcher is production-class. |
| **Scale** | ⚠️ Limited | Max tested: ~3,000 commits comfortably. |
| **UX** | ✅ High | Zed-inspired minimalist UI is polished. |
