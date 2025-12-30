import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { isDev, checkGitInstallation } from "./utils";
import { GitService } from "./services/git-service";
import { RepositoryWatcher } from "./services/repository-watcher";
import { SettingsService } from "./services/settings-service";
import { CommitFilterOptions } from "../shared/types";

class GitCanopyApp {
  private mainWindow: BrowserWindow | null = null;
  private gitService: GitService;
  private repositoryWatcher: RepositoryWatcher;
  private settingsService: SettingsService;

  constructor() {
    this.gitService = new GitService();
    this.repositoryWatcher = new RepositoryWatcher();
    this.settingsService = new SettingsService();
    this.initializeApp();
  }

  private initializeApp(): void {
    // Handle app ready
    app.whenReady().then(async () => {
      try {
        const isGitInstalled = await checkGitInstallation();
        if (!isGitInstalled) {
          dialog.showErrorBox(
            "Git Not Found",
            "Git is required to run GitCanopy. Please install Git and add it to your PATH, then restart the application.",
          );
          app.quit();
          return;
        }

        await this.createWindow();
        this.setupIpcHandlers();
        this.setupMenu();
      } catch (error) {
        console.error("Failed to initialize application:", error);
        dialog.showErrorBox(
          "Initialization Error",
          `Failed to start the application: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });

    // Quit when all windows are closed (except on macOS)
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    // On macOS, re-create window when dock icon is clicked
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    // Security: Prevent new window creation
    app.on("web-contents-created", (_, contents) => {
      // Disable Node.js integration in every webview
      contents.on("will-attach-webview", (event, webPreferences) => {
        // Strip away preload scripts if unused or verify their location is legitimate
        delete webPreferences.preload;

        // Disable Node.js integration
        webPreferences.nodeIntegration = false;
        webPreferences.contextIsolation = true;
        event.preventDefault();
      });

      // 1. Block navigation to external sites (only allow 'self')
      contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== "http://localhost:3000" && !isDev) {
          event.preventDefault();
        }
      });

      // 2. Prevent the app from opening new windows
      contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
      });

      // 3. Disable webview tags
      contents.on("will-attach-webview", (event) => {
        event.preventDefault();
      });

      // 4. Deny all permission requests (camera, mic, notifications, etc.)
      contents.session.setPermissionRequestHandler(
        (_webContents, _permission, callback) => {
          callback(false);
        },
      );
    });
  }

  private async createWindow(): Promise<void> {
    const settings = await this.settingsService.getSettings();
    const windowState = (settings as any).windowState || {
      width: 1400,
      height: 900,
      x: undefined,
      y: undefined,
    };

    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: windowState.width,
      height: windowState.height,
      x: windowState.x,
      y: windowState.y,
      minWidth: 800,
      minHeight: 600,
      show: false,
      titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "../../preload/preload/preload.js"),
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });
    // Load the renderer

    if (isDev) {
      this.mainWindow.loadURL("http://localhost:3000");
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, "../../renderer/index.html"));
    }

    // Show window when ready to prevent visual flash
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow?.show();

      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on("close", async () => {
      if (this.mainWindow) {
        const bounds = this.mainWindow.getBounds();
        const currentSettings = await this.settingsService.getSettings();
        await this.settingsService.saveSettings({
          ...currentSettings,
          windowState: bounds,
        } as any);
      }
    });

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  private setupMenu(): void {
    if (process.platform === "darwin") {
      const template: Electron.MenuItemConstructorOptions[] = [
        {
          label: app.getName(),
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
        {
          label: "File",
          submenu: [
            {
              label: "Open Repository...",
              accelerator: "CmdOrCtrl+O",
              click: () => this.handleSelectRepository(),
            },
            { type: "separator" },
            { role: "close" },
          ],
        },
        {
          label: "Edit",
          submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { role: "selectAll" },
          ],
        },
        {
          label: "View",
          submenu: [
            { role: "reload" },
            { role: "forceReload" },
            { role: "toggleDevTools" },
            { type: "separator" },
            { role: "resetZoom" },
            { role: "zoomIn" },
            { role: "zoomOut" },
            { type: "separator" },
            { role: "togglefullscreen" },
          ],
        },
        {
          label: "Window",
          submenu: [
            { role: "minimize" },
            { role: "zoom" },
            { type: "separator" },
            { role: "front" },
          ],
        },
      ];

      Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    } else {
      // Windows and Linux menu
      const template: Electron.MenuItemConstructorOptions[] = [
        {
          label: "File",
          submenu: [
            {
              label: "Open Repository...",
              accelerator: "CmdOrCtrl+O",
              click: () => this.handleSelectRepository(),
            },
            { type: "separator" },
            { role: "quit" },
          ],
        },
        {
          label: "Edit",
          submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { role: "selectAll" },
          ],
        },
        {
          label: "View",
          submenu: [
            { role: "reload" },
            { role: "forceReload" },
            { role: "toggleDevTools" },
            { type: "separator" },
            { role: "resetZoom" },
            { role: "zoomIn" },
            { role: "zoomOut" },
            { type: "separator" },
            { role: "togglefullscreen" },
          ],
        },
      ];

      Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }
  }

  private setupIpcHandlers(): void {
    // Repository operations
    ipcMain.handle("select-repository", () => this.handleSelectRepository());
    ipcMain.handle("select-directory", () => this.handleSelectDirectory());
    ipcMain.handle("get-repository", async (_, path: string) => {
      const repository = await this.gitService.getRepository(path);
      await this.settingsService.addRecentRepository(path);
      return repository;
    });
    ipcMain.handle("get-status", (_, repoPath: string) => 
      this.gitService.getStatus(repoPath)
    );
    ipcMain.handle("clone", (_, url: string, targetPath: string) => 
      this.gitService.clone(url, targetPath)
    );
    ipcMain.handle("clone-to-parent", (_, url: string, parentPath: string) => 
      this.gitService.cloneToParent(url, parentPath)
    );
    ipcMain.handle("stage-file", (_, repoPath: string, filePath: string) => 
      this.gitService.stageFile(repoPath, filePath)
    );
    ipcMain.handle("unstage-file", (_, repoPath: string, filePath: string) => 
      this.gitService.unstageFile(repoPath, filePath)
    );
    ipcMain.handle("commit", (_, repoPath: string, message: string) => 
      this.gitService.commit(repoPath, message)
    );
    ipcMain.handle("push", (_, repoPath: string) => 
      this.gitService.push(repoPath)
    );

    // Git data operations
    ipcMain.handle(
      "get-commits",
      (_, repoPath: string, limit?: number, offset?: number, options?: CommitFilterOptions) =>
        this.gitService.getCommits(repoPath, limit, offset, options),
    );
    ipcMain.handle("get-recent-commits", async (_, repoPath: string) => {
      const LIMIT = 5; // Display the last 5 commits
      return this.gitService.getCommits(repoPath, LIMIT, 0);
    });
    ipcMain.handle("get-branches", (_, repoPath: string) =>
      this.gitService.getBranches(repoPath),
    );
    ipcMain.handle("get-current-head", (_, repoPath: string) =>
      this.gitService.getCurrentHead(repoPath),
    );
    ipcMain.handle(
      "checkout-branch",
      (_, repoPath: string, branchName: string) =>
        this.gitService.checkoutBranch(repoPath, branchName),
    );
    ipcMain.handle("get-stash-list", (_, repoPath: string) =>
      this.gitService.getStashList(repoPath),
    );
    ipcMain.handle("git:apply-stash", (_, repoPath: string, index: string) =>
      this.gitService.applyStash(repoPath, index),
    );
    ipcMain.handle("git:drop-stash", (_, repoPath: string, index: string) =>
      this.gitService.dropStash(repoPath, index),
    );

    // Initial Path Handling
    ipcMain.handle("get-initial-repo", () => {
      const args = isDev ? process.argv.slice(2) : process.argv.slice(1);
      const lastArg = args[args.length - 1];

      if (lastArg && !lastArg.startsWith("-")) {
        const absolutePath = path.resolve(lastArg);

        if (
          fs.existsSync(absolutePath) &&
          fs.statSync(absolutePath).isDirectory()
        ) {
          return absolutePath;
        }
      }
      return null;
    });
    ipcMain.handle(
      "get-commit-details",
      (_, repoPath: string, commitHash: string) =>
        this.gitService.getCommitDetails(repoPath, commitHash),
    );
    ipcMain.handle("git:get-diff", (_, repoPath, commitHash, filePath) =>
      this.gitService.getDiff(repoPath, commitHash, filePath),
    );
    ipcMain.handle("git:get-hot-files", (_, repoPath, limit) =>
      this.gitService.getHotFiles(repoPath, limit),
    );
    ipcMain.handle("git:get-contributors", (_, repoPath) =>
      this.gitService.getContributors(repoPath),
    );
    ipcMain.handle("get-git-command-history", (_, limit?: number, offset?: number) =>
      this.gitService.getCommandHistory(limit, offset),
    );
    ipcMain.handle("clear-git-command-history", () =>
      this.gitService.clearCommandHistory(),
    );

    // File system operations
    ipcMain.handle("watch-repository", (_, repoPath: string) => {
      this.repositoryWatcher.watchRepository(repoPath, (event) => {
        // Send specific event type to renderer
        this.mainWindow?.webContents.send(event.type, event);
      });
    });
    ipcMain.handle("unwatch-repository", (_, repoPath: string) =>
      this.repositoryWatcher.unwatchRepository(repoPath),
    );

    // Settings
    ipcMain.handle("get-settings", () => this.settingsService.getSettings());
    ipcMain.handle("save-settings", (_, settings) =>
      this.settingsService.saveSettings(settings),
    );
    ipcMain.handle("clear-recent-repositories", () =>
      this.settingsService.clearRecentRepositories(),
    );

    // Utility
    ipcMain.handle("show-item-in-folder", (_, path: string) =>
      shell.showItemInFolder(path),
    );
    ipcMain.handle("open-external", (_, url: string) => {
      try {
        const parsed = new URL(url);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          return shell.openExternal(url);
        }
        console.warn(`Blocked attempt to open invalid protocol: ${parsed.protocol}`);
        return Promise.reject(new Error("Invalid protocol"));
      } catch (e) {
        console.warn(`Blocked attempt to open invalid URL: ${url}`);
        return Promise.reject(new Error("Invalid URL"));
      }
    });
  }

  private async handleSelectRepository(): Promise<any> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      title: "Select Git Repository",
      buttonLabel: "Select Repository",
      properties: ["openDirectory"],
      message: "Select a folder containing a Git repository",
    });

    if (result.canceled || !result.filePaths.length) {
      return null;
    }

    const repoPath = result.filePaths[0];
    try {
      const repository = await this.gitService.getRepository(repoPath);
      await this.settingsService.addRecentRepository(repoPath);
      return repository;
    } catch (error) {
      console.error("Failed to load repository:", error);

      dialog.showErrorBox(
        "Invalid Repository",
        `The selected folder does not contain a valid Git repository.\n\nPath: ${repoPath}\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`,
      );

      return null;
    }
  }

  private async handleSelectDirectory(): Promise<string | null> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      title: "Select Destination Directory",
      buttonLabel: "Select Directory",
      properties: ["openDirectory", "createDirectory"],
      message: "Select a folder to clone the repository into",
    });

    if (result.canceled || !result.filePaths.length) {
      return null;
    }

    return result.filePaths[0];
  }
}

// Create app instance
new GitCanopyApp();
