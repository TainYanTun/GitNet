import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from "electron";
import { join } from "path";
import { isDev } from "./utils";
import { GitService } from "./services/git-service";
import { RepositoryWatcher } from "./services/repository-watcher";
import { SettingsService } from "./services/settings-service";

class GitNetApp {
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
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIpcHandlers();
      this.setupMenu();
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
      contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
      });
    });
  }

  private createWindow(): void {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      show: false,
      titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,

        preload: join(__dirname, "../../preload/preload/preload.js"),
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });

    // Load the renderer
    if (isDev) {
      this.mainWindow.loadURL("http://localhost:3000");
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }

    // Show window when ready to prevent visual flash
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow?.show();

      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Handle window closed
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
    ipcMain.handle("get-repository", async (_, path: string) => {
      const repository = await this.gitService.getRepository(path);
      await this.settingsService.addRecentRepository(path);
      return repository;
    });

    // Git data operations
    ipcMain.handle(
      "get-commits",
      (_, repoPath: string, limit?: number, offset?: number) =>
        this.gitService.getCommits(repoPath, limit, offset),
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
    ipcMain.handle("get-stash-list", (_, repoPath: string) =>
      this.gitService.getStashList(repoPath),
    );
    ipcMain.handle(
      "get-commit-details",
      (_, repoPath: string, commitHash: string) =>
        this.gitService.getCommitDetails(repoPath, commitHash),
    );
    ipcMain.handle(
      "get-diff",
      (_, repoPath: string, commitHash: string, filePath: string) =>
        this.gitService.getDiff(repoPath, commitHash, filePath),
    );

    // File system operations
    ipcMain.handle("watch-repository", (_, repoPath: string) => {
      this.repositoryWatcher.watchRepository(repoPath, (event) => {
        this.mainWindow?.webContents.send("repository-event", event);
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
    ipcMain.handle("open-external", (_, url: string) =>
      shell.openExternal(url),
    );
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
            return repository;    } catch (error) {
      console.error("Failed to load repository:", error);

      dialog.showErrorBox(
        "Invalid Repository",
        `The selected folder does not contain a valid Git repository.\n\nPath: ${repoPath}\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`,
      );

      return null;
    }
  }
}

// Create app instance
new GitNetApp();
