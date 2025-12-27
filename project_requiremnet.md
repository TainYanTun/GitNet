# Git Commit Graph Visualizer - Project Requirements

## 1. Project Goal

Build a **desktop application** that visualizes a **local Git repository’s commit history** as an **interactive DAG**. The app must help developers understand **branch structure, merges, and commit intent** using **semantic colors and Railway-style lanes**. It is **read-only** and **offline-first**.

---

## 2. Tech Stack

* **Electron** – Desktop shell & system access
* **React** – UI framework
* **Node.js** – Git adapter & filesystem access
* **Git CLI** – Source of truth
* **D3.js (SVG)** – Graph rendering
* **Tailwind CSS** – Styling

---

## 3. Architecture

```
Electron Main Process
 └── Preload (contextBridge)
      └── Git Adapter (Node)
           └── Git CLI
                ↓
           Structured Commit Graph
                ↓
           React State
                ↓
           D3 Graph Renderer
```

sidebar text for test
---

## 4. Functional Requirements

### 4.1 Repository Selection

* User selects local folder
* App verifies Git repository with `git rev-parse --is-inside-work-tree`

### 4.2 Git Data Extraction

* Extract commit hash, parent hashes, message, timestamp, author & committer
* Detect merge commits (2+ parents)
* Commands:

```
git log --all --pretty=format:'%H|%P|%an|%ae|%ct|%s'
git branch --format='%(refname:short)|%(objectname)'
```

### 4.3 Commit Classification

* Parse **Conventional Commits**:

  * feat, fix, docs, style, refactor, perf, test, chore
* Unknown → `other`

### 4.4 Branch Detection

* Detect local branches, HEAD branch
* Stable visual lane per branch

### 4.5 Merge Handling

* Merge commit: 2+ parents, diamond node
* Fast-forward merges: linear, no merge node
* Squash merges: single commit with label

### 4.6 Visualization Rules

* Node fill: commit type
* Edge/lane color: branch
* Node shape: merge vs normal
* Optional border/icon: author
* Interactive: hover tooltip, click to focus, zoom & pan
* Legend required

### 4.7 Live Sync

* Monitor `HEAD` hash
* Auto-refresh graph on change
* No push/pull operations

---

## 5. Non-Functional Requirements

* Handle repos with 10k+ commits
* Lazy-load history
* Smooth interaction
* Color-blind friendly palette
* Cross-platform support

---

## 6. Data Model

```ts
export type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore' | 'other';

export interface Commit {
  hash: string;
  parents: string[];
  message: string;
  type: CommitType;
  author: { name: string; email: string };
  timestamp: number;
}
```

---

## 7. Out of Scope

* Creating a new VCS
* Editing commits
* Push/pull operations
* GitHub/GitLab authentication
* Conflict resolution

---

## 8. Deliverables

* Electron desktop app
* Interactive commit graph
* README documenting Git internals, visualization decisions, and architecture

---

## 9. Success Criteria

* Developer can identify branch structure, merge points, and commit intent at a glance
* UI is intuitive without reading docs
* App works fully offline

---

## 10. One-Line Description

> A Railway-style desktop Git visualizer that displays commit history as an interactive graph with semantic coloring and clear merge representation.
