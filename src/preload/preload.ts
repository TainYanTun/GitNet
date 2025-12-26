import { contextBridge, ipcRenderer } from "electron";
import type {
  GitNetAPI,
  AppEvent,
  Repository,
  Commit,
  Branch,
  StashEntry,
  AppSettings,
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
  ): Promise<Commit[]> =>
    ipcRenderer.invoke("get-commits", repoPath, limit, offset),

  getRecentCommits: (repoPath: string): Promise<Commit[]> =>
    ipcRenderer.invoke("get-recent-commits", repoPath),


  getBranches: (repoPath: string): Promise<Branch[]> =>
    ipcRenderer.invoke("get-branches", repoPath),

  getCurrentHead: (repoPath: string): Promise<string> =>
    ipcRenderer.invoke("get-current-head", repoPath),

  getStashList: (repoPath: string): Promise<StashEntry[]> =>
    ipcRenderer.invoke("get-stash-list", repoPath),
  getCommitDetails: (repoPath: string, commitHash: string): Promise<Commit> =>
    ipcRenderer.invoke("get-commit-details", repoPath, commitHash),

  // File system operations
  watchRepository: (repoPath: string): Promise<void> =>
    ipcRenderer.invoke("watch-repository", repoPath),

  unwatchRepository: (repoPath: string): Promise<void> =>
    ipcRenderer.invoke("unwatch-repository", repoPath),

  // Settings
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke("get-settings"),

  saveSettings: (settings: AppSettings): Promise<void> =>
    ipcRenderer.invoke("save-settings", settings),

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
contextBridge.exposeInMainWorld("gitnetAPI", gitnetAPI);

// Listen for repository events from main process
ipcRenderer.on("repository-event", (_, event: AppEvent) => {
  // Forward events to the appropriate listeners
  switch (event.type) {
    case "repository-changed":
      ipcRenderer.emit("repository-changed", null, event);
      break;
    case "commits-updated":
      ipcRenderer.emit("commits-updated", null, event);
      break;
    case "branches-updated":
      ipcRenderer.emit("branches-updated", null, event);
      break;
    case "head-changed":
      ipcRenderer.emit("head-changed", null, event);
      break;
  }
});

// Log that preload script has loaded (development only)
if (process.env.NODE_ENV === "development") {
  console.log("🔧 GitNet preload script loaded");
}

// Prevent the renderer process from accessing Node.js APIs
Object.freeze(gitnetAPI);
