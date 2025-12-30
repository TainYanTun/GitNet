# GitCanopy: Production Readiness Roadmap

This document outlines the critical architectural, performance, and security enhancements required to transition GitCanopy from a functional prototype to a production-grade desktop application.

---

## ✅ Phase 1: Stability & Safety (Completed)
- [x] **Virtualized Lists:** Implemented `react-window` for Commit History and Diff views to handle 10k+ rows.
- [x] **Off-Thread Layout:** Layout calculations moved to a Web Worker to keep the UI thread 100% responsive.
- [x] **Stdout Safety:** Implemented 10MB safety buffers on all Git binary interactions to prevent memory exhaustion.
- [x] **Porcelain Status:** Robust parsing of working tree changes for staging and committing.
- [x] **Security Hardening:** Strict IPC validation and Electron isolation (nodeIntegration: false).

## 🚀 Phase 2: Ultimate Scalability (Next Up)
- [ ] **Canvas-Based Graph Rendering:** Transition the D3 rendering engine from SVG to HTML5 Canvas. SVG nodes become a memory burden after ~2,000 commits; Canvas can handle 50,000+ nodes with 60FPS fluid motion.
- [ ] **Viewport Culling:** Only draw the section of the graph/canvas currently visible to the user.
- [ ] **Partial History Fetching:** Modify the `GitService` to stream commits in chunks (e.g., 500 at a time) rather than loading the entire history into memory at once.

## 🛠 Phase 3: Robustness & Git Edge Cases
- [ ] **State Awareness Indicators:** 
    - Better UI for Merge conflicts (highlighting unmerged files).
    - Submodule "Drill-down" support.
- [ ] **Binary & Large File Handling:** Implement guards for diffs. If a file is binary, show a "Preview unavailable" message.

## 📦 Phase 4: Distribution & Trust
- [ ] **Code Signing & Notarization:** Setup for macOS (Apple Developer) and Windows (EV Certificate).
- [ ] **Auto-Updater:** Integrate `electron-updater` for background updates.
- [ ] **CI/CD Pipeline:** Automated multi-architecture builds (`x64`, `arm64`).

## 🔍 Phase 5: Observability
- [ ] **Local Logging Pipeline:** Rotating log file system in the user's data directory.
- [ ] **Crash Reporting:** Integration with Sentry to capture main-process crashes.

---

## Current Status: Production-Stable (Core)
| Metric | Status | Note |
| :--- | :--- | :--- |
| **Logic** | ✅ Excellent | "Main Spine" algorithm is reliable. |
| **Sync** | ✅ Great | Recursive watcher is production-class. |
| **Scale** | ✅ High | Handles ~10,000 commits comfortably via virtualization. |
| **Security**| ✅ Verified | Hardened Electron environment and safe Git spawn. |
| **UX** | ✅ Elite | Zed-inspired minimalist UI is highly polished. |