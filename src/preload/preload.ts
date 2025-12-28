import { contextBridge, ipcRenderer } from "electron";
import type {
  GitNetAPI,
  AppEvent,
  Repository,
  Commit,
  Branch,
  StashEntry,
  AppSettings,
  CommitFilter,
  GitCommandLog,
} from "../shared/types";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const gitnetAPI: GitNetAPI = {
  // Repository operations
  selectRepository: (): Promise<Repository | null> =>
    ipcRenderer.invoke("select-repository"),

  getRepository: (path: string): Promise<Repository> =>
    ipcRenderer.invoke("get-repository", path),

  // Git data operations
  getCommits: (
    repoPath: string,
    limit?: number,
    offset?: number,
    filter?: CommitFilter,
  ): Promise<Commit[]> =>
    ipcRenderer.invoke("get-commits", repoPath, limit, offset, filter),

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
  getCommitDetails: (repoPath: string, commitHash: string): Promise<Commit> =>
    ipcRenderer.invoke("get-commit-details", repoPath, commitHash),

  getDiff: (repoPath: string, commitHash: string, filePath: string) =>
    ipcRenderer.invoke("git:get-diff", repoPath, commitHash, filePath),
  getHotFiles: (repoPath: string, limit?: number) =>
    ipcRenderer.invoke("git:get-hot-files", repoPath, limit),
  getContributors: (repoPath: string) =>
    ipcRenderer.invoke("git:get-contributors", repoPath),
  getGitCommandHistory: (): Promise<GitCommandLog[]> =>
    ipcRenderer.invoke("get-git-command-history"),

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
console.log("Exposing gitnetAPI with keys:", Object.keys(gitnetAPI));
contextBridge.exposeInMainWorld("gitnetAPI", gitnetAPI);

// Log that preload script has loaded (development only)
if (process.env.NODE_ENV === "development") {
  console.log("🔧 GitNet preload script loaded");
}

// Prevent the renderer process from accessing Node.js APIs
Object.freeze(gitnetAPI);
