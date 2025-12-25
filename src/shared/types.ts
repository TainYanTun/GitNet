// Shared type definitions for GitNet application

export type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore' | 'other';

export type BranchType = 'main' | 'develop' | 'feature' | 'release' | 'hotfix' | 'custom';

export interface Author {
  name: string;
  email: string;
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

export interface Repository {
  path: string;
  name: string;
  isValidGit: boolean;
  currentBranch: string;
  headCommit: string;
  branches: Branch[];
  totalCommits: number;
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

export interface GraphNode {
  id: string;
  commit: Commit;
  x: number;
  y: number;
  lane: number;
  color: string;
  shape: 'circle' | 'diamond' | 'square';
  size: number;
  children: string[];
  parents: string[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  color: string;
  type: 'normal' | 'merge' | 'branch';
  points: Array<{ x: number; y: number }>;
}

export interface VisualizationData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
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
  theme: 'light' | 'dark' | 'system';
  maxCommits: number;
  autoRefresh: boolean;
  refreshInterval: number;
  showAuthor: boolean;
  showTimestamp: boolean;
  compactMode: boolean;
  colorBlindMode: boolean;
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
  type: 'repository-changed';
  repository: Repository;
}

export interface CommitsUpdatedEvent {
  type: 'commits-updated';
  commits: Commit[];
}

export interface BranchesUpdatedEvent {
  type: 'branches-updated';
  branches: Branch[];
}

export interface HeadChangedEvent {
  type: 'head-changed';
  newHead: string;
  oldHead: string;
}

export type AppEvent =
  | RepositoryChangedEvent
  | CommitsUpdatedEvent
  | BranchesUpdatedEvent
  | HeadChangedEvent;

// API interfaces for IPC communication
export interface GitNetAPI {
  // Repository operations
  selectRepository: () => Promise<Repository | null>;
  getRepository: (path: string) => Promise<Repository>;

  // Git data operations
  getCommits: (repoPath: string, limit?: number, offset?: number) => Promise<Commit[]>;
  getBranches: (repoPath: string) => Promise<Branch[]>;
  getCurrentHead: (repoPath: string) => Promise<string>;

  // File system operations
  watchRepository: (repoPath: string) => Promise<void>;
  unwatchRepository: (repoPath: string) => Promise<void>;

  // Settings
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;

  // Events
  onRepositoryChanged: (callback: (event: RepositoryChangedEvent) => void) => void;
  onCommitsUpdated: (callback: (event: CommitsUpdatedEvent) => void) => void;
  onBranchesUpdated: (callback: (event: BranchesUpdatedEvent) => void) => void;
  onHeadChanged: (callback: (event: HeadChangedEvent) => void) => void;

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
