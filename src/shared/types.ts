// Shared type definitions for GitNet application

export type CommitType =
  | "feat"
  | "fix"
  | "docs"
  | "style"
  | "refactor"
  | "perf"
  | "test"
  | "chore"
  | "revert"
  | "other";

export type BranchType =
  | "main"
  | "develop"
  | "feature"
  | "release"
  | "hotfix"
  | "custom";

export interface Author {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface FileChange {
  status: "A" | "M" | "D" | "R" | "C" | "U"; // Added, Modified, Deleted, Renamed, Copied, Unmerged
  path: string;
  previousPath?: string; // For renamed/copied files
}

export interface CommitParent {
  hash: string;
  shortHash: string;
  author?: Author; // Optional author details
  shortMessage?: string; // Optional short message
}

export interface CommitStats {
  additions: number;
  deletions: number;
  total: number;
}

export interface Commit {
  hash: string;
  shortHash: string;
  parents: string[];
  message: string;
  shortMessage: string;
  type: CommitType;
  author: Author;
  committer: Author;
  timestamp: number;
  isMerge: boolean;
  isSquash: boolean;
  branchName?: string;

  // New properties for detailed view
  parentsDetails?: CommitParent[]; // Detailed parent info
  fileChanges?: FileChange[];
  branches?: string[]; // Branches that contain this commit
  branchTips?: string[]; // Branches that point exactly to this commit
  tags?: string[]; // Tags that point to this commit
  children?: CommitParent[]; // Direct children of this commit (optional, for graph navigation)
  stats?: CommitStats; // Commit statistics (lines added/deleted)
}

export interface Branch {
  name: string;
  type: BranchType;
  objectName: string;
  isHead: boolean;
  isLocal: boolean;
  isRemote: boolean;
  upstream?: string;
  color: string;
  lane: number;
}

export type StashEntry = string;

export interface Repository {
  path: string;
  name: string;
  isValidGit: boolean;
  currentBranch: string;
  headCommit: string;
  branches: Branch[];
  totalCommits: number;
  isRebasing: boolean;
  isMerging: boolean;
  isDetached: boolean;
}

export interface CommitGraph {
  commits: Commit[];
  branches: Branch[];
  repository: Repository;
  lanes: LaneInfo[];
}

export interface LaneInfo {
  id: number;
  branchName: string;
  color: string;
  startCommit: string;
  endCommit?: string;
}

export interface LaneSegment {
  lane: number;
  x: number;
  startY: number;
  endY: number;
  color: string;
  branchName: string;
}

export interface GraphNode {
  id: string;
  commit: Commit;
  x: number;
  y: number;
  lane: number;
  color: string;
  shape: "circle" | "diamond" | "square";
  size: number;
  children: string[];
  parents: string[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  color: string;
  type: "normal" | "merge" | "branch";
  points: Array<{ x: number; y: number }>;
}

export interface VisualizationData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  laneSegments: LaneSegment[];
  width: number;
  height: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface GitCommandLog {
  id: string;
  command: string;
  args: string[];
  timestamp: number;
  duration: number;
  exitCode: number;
  success: boolean;
}

export interface GitCommand {
  command: string;
  args: string[];
  cwd: string;
}

export interface GitCommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  code: number;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  maxCommits: number;
  autoRefresh: boolean;
  refreshInterval: number;
  showAuthor: boolean;
  showTimestamp: boolean;
  compactMode: boolean;
  colorBlindMode: boolean;
  recentRepositories?: string[];
}

export interface TooltipData {
  commit: Commit;
  x: number;
  y: number;
  visible: boolean;
}

export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

// Events
export interface RepositoryChangedEvent {
  type: "repository-changed";
  repository: Repository;
}

export interface CommitsUpdatedEvent {
  type: "commits-updated";
  commits: Commit[];
}

export interface BranchesUpdatedEvent {
  type: "branches-updated";
  branches: Branch[];
}

export interface HeadChangedEvent {
  type: "head-changed";
  newHead: string;
  oldHead: string;
}

export type AppEvent =
  | RepositoryChangedEvent
  | CommitsUpdatedEvent
  | BranchesUpdatedEvent
  | HeadChangedEvent;

export interface HotFile {
  path: string;
  count: number;
}

export interface ContributorStats {
  name: string;
  email: string;
  avatarUrl: string;
  commitCount: number;
  additions: number;
  deletions: number;
  firstCommit: number;
  lastCommit: number;
  activity: number[]; // Array of commit counts across time buckets
}

// API interfaces for IPC communication
export interface GitNetAPI {
  // Repository operations
  selectRepository: () => Promise<Repository | null>;
  getRepository: (path: string) => Promise<Repository>;

  // Git data operations
  getCommits: (
    repoPath: string,
    limit?: number,
    offset?: number,
    filePath?: string,
  ) => Promise<Commit[]>;
  getRecentCommits: (repoPath: string) => Promise<Commit[]>;
  getBranches: (repoPath: string) => Promise<Branch[]>;
  getCurrentHead: (repoPath: string) => Promise<string>;
  checkoutBranch: (repoPath: string, branchName: string) => Promise<void>;
  getStashList: (repoPath: string) => Promise<StashEntry[]>;
  applyStash: (repoPath: string, index: string) => Promise<void>;
  dropStash: (repoPath: string, index: string) => Promise<void>;
  getCommitDetails: (repoPath: string, commitHash: string) => Promise<Commit>;
  getDiff: (
    repoPath: string,
    commitHash: string,
    filePath: string,
  ) => Promise<string>;
  getHotFiles: (repoPath: string, limit?: number) => Promise<HotFile[]>;
  getContributors: (repoPath: string) => Promise<ContributorStats[]>;
  getGitCommandHistory: (limit?: number, offset?: number) => Promise<GitCommandLog[]>;
  clearGitCommandHistory: () => Promise<void>;

  // File system operations
  watchRepository: (repoPath: string) => Promise<void>;
  unwatchRepository: (repoPath: string) => Promise<void>;

  // Settings
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;
  clearRecentRepositories: () => Promise<void>;

  getInitialRepo: () => Promise<string | null>;

  // Events
  onRepositoryChanged: (
    callback: (event: RepositoryChangedEvent) => void,
  ) => () => void;
  onCommitsUpdated: (
    callback: (event: CommitsUpdatedEvent) => void,
  ) => () => void;
  onBranchesUpdated: (
    callback: (event: BranchesUpdatedEvent) => void,
  ) => () => void;
  onHeadChanged: (callback: (event: HeadChangedEvent) => void) => () => void;

  // Utility
  showItemInFolder: (path: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gitnetAPI: GitNetAPI;
  }
}

export {};
