import { contextBridge, ipcRenderer } from "electron";
import type {
  GitCanopyAPI,
  AppEvent,
  Repository,
  Commit,
  Branch,
  StashEntry,
  AppSettings,
  GitCommandLog,
  CommitFilterOptions,
} from "../shared/types";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const gitcanopyAPI: GitCanopyAPI = {
  // Repository operations
  selectRepository: (): Promise<Repository | null> =>
    ipcRenderer.invoke("select-repository"),

  getRepository: (path: string) => ipcRenderer.invoke("get-repository", path),
  getStatus: (repoPath: string) => ipcRenderer.invoke("get-status", repoPath),
  clone: (url: string, targetPath: string) => ipcRenderer.invoke("clone", url, targetPath),
  stageFile: (repoPath: string, filePath: string) => ipcRenderer.invoke("stage-file", repoPath, filePath),
  unstageFile: (repoPath: string, filePath: string) => ipcRenderer.invoke("unstage-file", repoPath, filePath),
  commit: (repoPath: string, message: string) => ipcRenderer.invoke("commit", repoPath, message),
  push: (repoPath: string) => ipcRenderer.invoke("push", repoPath),

  // Git data operations
  getCommits: (
    repoPath: string,
    limit?: number,
    offset?: number,
    options?: CommitFilterOptions,
  ): Promise<Commit[]> =>
    ipcRenderer.invoke("get-commits", repoPath, limit, offset, options),

  getRecentCommits: (repoPath: string): Promise<Commit[]> =>
    ipcRenderer.invoke("get-recent-commits", repoPath),


  getBranches: (repoPath: string): Promise<Branch[]> =>
    ipcRenderer.invoke("get-branches", repoPath),

  getCurrentHead: (repoPath: string): Promise<string> =>
    ipcRenderer.invoke("get-current-head", repoPath),

  checkoutBranch: (repoPath: string, branchName: string): Promise<void> =>
    ipcRenderer.invoke("checkout-branch", repoPath, branchName),

  getStashList: (repoPath: string): Promise<StashEntry[]> =>
    ipcRenderer.invoke("get-stash-list", repoPath),

  applyStash: (repoPath: string, index: string): Promise<void> =>
    ipcRenderer.invoke("git:apply-stash", repoPath, index),

  dropStash: (repoPath: string, index: string): Promise<void> =>
    ipcRenderer.invoke("git:drop-stash", repoPath, index),

  getCommitDetails: (repoPath: string, commitHash: string): Promise<Commit> =>
    ipcRenderer.invoke("get-commit-details", repoPath, commitHash),

  getDiff: (repoPath: string, commitHash: string, filePath: string) =>
    ipcRenderer.invoke("git:get-diff", repoPath, commitHash, filePath),
  getHotFiles: (repoPath: string, limit?: number) =>
    ipcRenderer.invoke("git:get-hot-files", repoPath, limit),
  getContributors: (repoPath: string) =>
    ipcRenderer.invoke("git:get-contributors", repoPath),
  getGitCommandHistory: (limit?: number, offset?: number): Promise<GitCommandLog[]> =>
    ipcRenderer.invoke("get-git-command-history", limit, offset),
  clearGitCommandHistory: (): Promise<void> =>
    ipcRenderer.invoke("clear-git-command-history"),

  // File system operations
  watchRepository: (repoPath: string): Promise<void> =>
    ipcRenderer.invoke("watch-repository", repoPath),

  unwatchRepository: (repoPath: string): Promise<void> =>
    ipcRenderer.invoke("unwatch-repository", repoPath),

  // Settings
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke("get-settings"),

  saveSettings: (settings: AppSettings): Promise<void> =>
    ipcRenderer.invoke("save-settings", settings),

  clearRecentRepositories: (): Promise<void> =>
    ipcRenderer.invoke("clear-recent-repositories"),

  getInitialRepo: (): Promise<string | null> =>
    ipcRenderer.invoke("get-initial-repo"),

  // Event listeners
  onRepositoryChanged: (callback: (event: any) => void): (() => void) => {
    const wrappedCallback = (_: any, event: any) => callback(event);
    ipcRenderer.on("repository-changed", wrappedCallback);
    return () => {
      ipcRenderer.removeListener("repository-changed", wrappedCallback);
    };
  },

  onCommitsUpdated: (callback: (event: any) => void): (() => void) => {
    const wrappedCallback = (_: any, event: any) => callback(event);
    ipcRenderer.on("commits-updated", wrappedCallback);
    return () => {
      ipcRenderer.removeListener("commits-updated", wrappedCallback);
    };
  },

  onBranchesUpdated: (callback: (event: any) => void): (() => void) => {
    const wrappedCallback = (_: any, event: any) => callback(event);
    ipcRenderer.on("branches-updated", wrappedCallback);
    return () => {
      ipcRenderer.removeListener("branches-updated", wrappedCallback);
    };
  },

  onHeadChanged: (callback: (event: any) => void): (() => void) => {
    const wrappedCallback = (_: any, event: any) => callback(event);
    ipcRenderer.on("head-changed", wrappedCallback);
    return () => {
      ipcRenderer.removeListener("head-changed", wrappedCallback);
    };
  },

  // Utility functions
  showItemInFolder: (path: string): Promise<void> =>
    ipcRenderer.invoke("show-item-in-folder", path),

  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke("open-external", url),
};

// Expose the API to the renderer process
if (process.env.NODE_ENV === "development") {
  console.log("🔧 [Preload] Exposing gitcanopyAPI with keys:", Object.keys(gitcanopyAPI));
}
contextBridge.exposeInMainWorld("gitcanopyAPI", gitcanopyAPI);

// Log that preload script has loaded (development only)
if (process.env.NODE_ENV === "development") {
  console.log("🔧 GitCanopy preload script loaded");
}

// Prevent the renderer process from accessing Node.js APIs
Object.freeze(gitcanopyAPI);
