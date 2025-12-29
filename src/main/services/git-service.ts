import { spawn } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
  Repository,
  Commit,
  Branch,
  FileChange,
  CommitParent,
  HotFile,
  ContributorStats,
  GitCommandLog,
} from "../../shared/types";

export class GitService {
  private commandHistory: GitCommandLog[] = [];
  private maxHistorySize = 100;

  private getAvatarUrl(email: string): string {
    const hash = crypto
      .createHash("md5")
      .update(email.trim().toLowerCase())
      .digest("hex");
    return `https://www.gravatar.com/avatar/${hash}?s=64&d=identicon`;
  }

  private async run(args: string[], cwd: string): Promise<string> {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const gitProcess = spawn("git", args, { cwd });
      let stdout = "";
      let stderr = "";

      gitProcess.stdout.on("data", (data) => (stdout += data));
      gitProcess.stderr.on("data", (data) => (stderr += data));

      gitProcess.on("close", (code) => {
        const duration = Date.now() - startTime;
        this.logCommand(args, code === 0, code || 0, duration);

        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `Git command failed with code ${code}`));
        }
      });

      gitProcess.on("error", (err) => {
        const duration = Date.now() - startTime;
        this.logCommand(args, false, -1, duration);
        reject(err);
      });
    });
  }

  private logCommand(args: string[], success: boolean, exitCode: number, duration: number) {
    const log: GitCommandLog = {
      id: Math.random().toString(36).substring(2, 9),
      command: "git",
      args,
      timestamp: Date.now(),
      duration,
      exitCode,
      success,
    };

    this.commandHistory.unshift(log);
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.pop();
    }
  }

  getCommandHistory(limit?: number, offset?: number): GitCommandLog[] {
    if (limit === undefined && offset === undefined) {
      return this.commandHistory;
    }
    
    const start = offset || 0;
    const end = limit !== undefined ? start + limit : this.commandHistory.length;
    
    return this.commandHistory.slice(start, end);
  }

  clearCommandHistory(): void {
    this.commandHistory = [];
  }

  async getHotFiles(repoPath: string, limit = 10): Promise<HotFile[]> {
    try {
      // Use log with --name-only to get all changed files across all branches
      const output = await this.run(["log", "--all", "--format=", "--name-only"], repoPath);
      
      const counts: Record<string, number> = {};
      const lines = output.split('\n');
      
      for (const line of lines) {
        const path = line.trim();
        if (path) {
          counts[path] = (counts[path] || 0) + 1;
        }
      }

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([path, count]) => ({ path, count }));
    } catch (error) {
      return [];
    }
  }

  async getContributors(repoPath: string): Promise<ContributorStats[]> {
    try {
      // Use git log to get stats per author
      const output = await this.run(
        ["log", "--all", "--pretty=format:%an|%ae|%ct", "--shortstat"], 
        repoPath
      );
      
      const lines = output.split('\n');
      const statsMap = new Map<string, ContributorStats>();
      
      let currentAuthor: { name: string, email: string, timestamp: number } | null = null;
      
      // First pass: find project-wide bounds
      const allTimestamps = lines
        .filter(l => l.includes('|'))
        .map(l => parseInt(l.split('|')[2], 10));
      
      if (allTimestamps.length === 0) return [];
      
      const projectStart = Math.min(...allTimestamps);
      const projectEnd = Math.max(...allTimestamps);
      const duration = projectEnd - projectStart || 1;

      for (const line of lines) {
        if (line.includes('|')) {
          const [name, email, timestampStr] = line.split('|');
          const timestamp = parseInt(timestampStr, 10);
          currentAuthor = { name, email, timestamp };
          
          if (!statsMap.has(email)) {
            statsMap.set(email, {
              name,
              email,
              avatarUrl: this.getAvatarUrl(email),
              commitCount: 0,
              additions: 0,
              deletions: 0,
              firstCommit: timestamp,
              lastCommit: timestamp,
              activity: new Array(20).fill(0)
            });
          }
          
          const stats = statsMap.get(email)!;
          stats.commitCount++;
          stats.firstCommit = Math.min(stats.firstCommit, timestamp);
          stats.lastCommit = Math.max(stats.lastCommit, timestamp);

          // Assign to bucket
          const bucketIndex = Math.min(
            19,
            Math.floor(((timestamp - projectStart) / duration) * 20)
          );
          stats.activity[bucketIndex]++;
        } else if (line.includes('insertion') || line.includes('deletion')) {
          if (currentAuthor) {
            const stats = statsMap.get(currentAuthor.email)!;
            const addMatch = line.match(/(\d+) insertion/);
            const delMatch = line.match(/(\d+) deletion/);
            
            if (addMatch) stats.additions += parseInt(addMatch[1], 10);
            if (delMatch) stats.deletions += parseInt(delMatch[1], 10);
          }
        }
      }
      
      return Array.from(statsMap.values()).sort((a, b) => b.commitCount - a.commitCount);
    } catch (error) {
      return [];
    }
  }
  async getRepository(repoPath: string): Promise<Repository> {
    // Verify it's a Git repository
    try {
      await this.run(["rev-parse", "--is-inside-work-tree"], repoPath);
    } catch {
      throw new Error("Not a Git repository");
    }

    const name = repoPath.split("/").pop() || "Unknown";
    
    // Parallel detection of states and data
    const [currentBranch, headCommit, branches, isRebasing, isMerging, isDetached] = await Promise.all([
      this.getCurrentBranch(repoPath),
      this.getCurrentHead(repoPath),
      this.getBranches(repoPath),
      this.checkIsRebasing(repoPath),
      this.checkIsMerging(repoPath),
      this.checkIsDetached(repoPath)
    ]);

    return {
      path: repoPath,
      name,
      isValidGit: true,
      currentBranch,
      headCommit,
      branches,
      totalCommits: 0, // Will be calculated later
      isRebasing,
      isMerging,
      isDetached
    };
  }

  private async checkIsRebasing(repoPath: string): Promise<boolean> {
    const gitPath = path.join(repoPath, '.git');
    return fs.existsSync(path.join(gitPath, 'rebase-merge')) || 
           fs.existsSync(path.join(gitPath, 'rebase-apply'));
  }

  private async checkIsMerging(repoPath: string): Promise<boolean> {
    const gitPath = path.join(repoPath, '.git');
    return fs.existsSync(path.join(gitPath, 'MERGE_HEAD'));
  }

  private async checkIsDetached(repoPath: string): Promise<boolean> {
    try {
      await this.run(["symbolic-ref", "-q", "HEAD"], repoPath);
      return false; // Symbolic ref exists, so not detached
    } catch {
      return true; // Command failed, likely detached
    }
  }

  async getCommits(
    repoPath: string,
    limit = 100,
    offset = 0
  ): Promise<Commit[]> {
    const args = [
      "log",
      "--all",
      "--pretty=format:%H|%P|%an|%ae|%ct|%s|%D",
      `--skip=${offset}`,
      `-n`,
      `${limit}`
    ];

    try {
      const [branches, tagMap] = await Promise.all([
        this.getBranches(repoPath),
        this.getTags(repoPath)
      ]);

      const branchMap = new Map<string, string>();
      branches.forEach((branch) => {
        branchMap.set(branch.objectName, branch.name);
      });

      const output = await this.run(args, repoPath);
      return this.parseCommits(output, branchMap, tagMap);
    } catch {
      return [];
    }
  }

  async getTags(repoPath: string): Promise<Map<string, string[]>> {
    try {
      const output = await this.run(
        ["show-ref", "--tags", "--dereference"],
        repoPath
      );
      const tagMap = new Map<string, string[]>();
      output.split('\n').forEach(line => {
        if (!line) return;
        const [hash, ref] = line.split(' ');
        const tagName = ref.replace('refs/tags/', '').replace('^{}', '');
        const list = tagMap.get(hash) || [];
        if (!list.includes(tagName)) {
            list.push(tagName);
            tagMap.set(hash, list);
        }
      });
      return tagMap;
    } catch {
      return new Map();
    }
  }

  async getBranches(repoPath: string): Promise<Branch[]> {
    try {
      const output = await this.run(
        ["branch", "-a", "--format=%(refname:short)|%(objectname)"],
        repoPath
      );
      return this.parseBranches(output);
    } catch {
      return [];
    }
  }

  async getCurrentHead(repoPath: string): Promise<string> {
    try {
      const output = await this.run(["rev-parse", "HEAD"], repoPath);
      return output.trim();
    } catch {
      return "";
    }
  }

  async checkoutBranch(repoPath: string, branchName: string): Promise<void> {
    try {
      await this.run(["checkout", branchName], repoPath);
    } catch (error) {
      console.error(`Failed to checkout branch ${branchName}:`, error);
      throw error;
    }
  }

  async getStashList(repoPath: string): Promise<string[]> {
    try {
      const output = await this.run(["stash", "list", "--pretty=format:%gd: %gs"], repoPath);
      return output.trim().split("\n").filter((line) => line.length > 0);
    } catch (error) {
      return [];
    }
  }

  async applyStash(repoPath: string, index: string): Promise<void> {
    await this.run(["stash", "apply", index], repoPath);
  }

  async dropStash(repoPath: string, index: string): Promise<void> {
    await this.run(["stash", "drop", index], repoPath);
  }


  async getCommitDetails(repoPath: string, commitHash: string): Promise<Commit> {
    const args = ["show", "--pretty=format:%H|%P|%an|%ae|%ad|%s", "--numstat", "--date=raw", commitHash];
    const tagArgs = ["tag", "--contains", commitHash];
    const branchArgs = ["branch", "--contains", commitHash, "--format=%(refname:short)"];
    const tipArgs = ["branch", "--points-at", commitHash, "--format=%(refname:short)"];

    try {
      const [output, tagsOutput, branchesOutput, tipsOutput] = await Promise.all([
        this.run(args, repoPath),
        this.run(tagArgs, repoPath).catch(() => ""),
        this.run(branchArgs, repoPath).catch(() => ""),
        this.run(tipArgs, repoPath).catch(() => "")
      ]);

      const commit = this.parseDetailedCommit(output, tagsOutput, branchesOutput);
      
      // Mark which branches are tips
      const tips = tipsOutput.trim().split("\n").filter(Boolean);
      if (tips.length > 0) {
        (commit as any).branchTips = tips;
      }

      return commit;
    } catch (error) {
      console.error(`Failed to get commit details for ${commitHash}:`, error);
      throw error;
    }
  }

  private parseDetailedCommit(
    output: string,
    tagsOutput: string,
    branchesOutput: string,
  ): Commit {
    const lines = output.trim().split("\n");
    const [headerLine, ...restLines] = lines;
    const [hash, parentsHashes, authorName, authorEmail, authorTimestamp, subject] = headerLine.split("|");

    // Parse file changes and stats
    let additions = 0;
    let deletions = 0;
    const fileChanges: FileChange[] = [];
    let parsingFiles = false;

    for (const line of restLines) {
      if (line.match(/^\d+\t\d+\t.+/)) { // Numstat line
        parsingFiles = true;
        const [added, deleted, filePath] = line.split('\t');
        additions += parseInt(added);
        deletions += parseInt(deleted);
        fileChanges.push({ status: 'M', path: filePath }); // Assuming 'M' for simplicity, actual status needs more parsing
      } else if (parsingFiles && line.startsWith('--- a/')) {
          // This marks the start of diff, we can stop parsing numstat
          break;
      }
    }

    const parentsDetails: CommitParent[] = parentsHashes
      .split(" ")
      .filter(Boolean)
      .map((pHash) => ({
        hash: pHash,
        shortHash: pHash.substring(0, 7),
      }));

    const tags = tagsOutput.trim().split('\n').filter(Boolean);
    const branches = branchesOutput.trim().split('\n').filter(Boolean);

    return {
      hash,
      shortHash: hash.substring(0, 7),
      parents: parentsHashes.split(" ").filter(Boolean),
      message: subject, // subject is usually the first line
      shortMessage: subject.split('\n')[0],
      type: this.getCommitType(subject), // Re-using existing helper
      author: {
        name: authorName,
        email: authorEmail,
        avatarUrl: this.getAvatarUrl(authorEmail),
      },
      committer: {
        name: authorName,
        email: authorEmail,
        avatarUrl: this.getAvatarUrl(authorEmail),
      }, // Assuming committer is same for now
      timestamp: parseInt(authorTimestamp.split(' ')[0]), // git show --date=raw gives "timestamp timezone", we only need timestamp
      isMerge: parentsHashes.split(" ").filter(Boolean).length > 1,
      isSquash: false, // Cannot determine from 'git show' easily without more complex logic
      parentsDetails,
      fileChanges,
      branches,
      tags,
      stats: {
        additions,
        deletions,
        total: additions + deletions,
      },
    };
  }


  async getDiff(repoPath: string, commitHash: string, filePath: string): Promise<string> {
    try {
      // 1. First check the size/type using numstat
      const statsArgs = ["diff", `${commitHash}^`, commitHash, "--numstat", "--", filePath];
      const statsOutput = await this.run(statsArgs, repoPath).catch(() => "");
      
      if (statsOutput) {
        const [added, deleted] = statsOutput.split("\t");
        if (added === "-" || deleted === "-") {
          return "Binary file - preview unavailable.";
        }
        
        const totalChanges = parseInt(added) + parseInt(deleted);
        if (totalChanges > 5000) {
          return `File too large (${totalChanges} changes). Direct preview disabled for performance.`;
        }
      }

      // 2. Fetch the actual diff
      const args = ["diff", `${commitHash}^`, commitHash, "--", filePath];
      return await this.run(args, repoPath);
    } catch (error) {
      console.error(`Failed to get diff for ${filePath} at commit ${commitHash}:`, error);
      return "Error loading diff content.";
    }
  }

  private async getCurrentBranch(repoPath: string): Promise<string> {
    try {
      const output = await this.run(["symbolic-ref", "--short", "HEAD"], repoPath);
      return output.trim();
    } catch {
      try {
        // Fallback for detached HEAD: show short hash
        const output = await this.run(["rev-parse", "--short", "HEAD"], repoPath);
        return output.trim() || "Detached";
      } catch {
        return "Unknown";
      }
    }
  }

  private parseCommits(
    output: string,
    branchMap: Map<string, string>,
    tagMap: Map<string, string[]>,
  ): Commit[] {
    if (!output.trim()) return [];

    const lines = output.trim().split("\n");
    
    // We'll process from newest to oldest, but we need to track active branches
    // for commits that don't have explicit decorations.
    const activeBranchMap = new Map<string, string>();

    return lines.map((line) => {
      const parts = line.split("|");
      const [hash, parents, author, email, timestamp, subject, decoration] = parts;

      let branchName = branchMap.get(hash);

      if (!branchName && decoration) {
        const refs = decoration.split(", ").map(r => r.trim());
        for (const ref of refs) {
          const match = ref.match(/^(?:HEAD -> )?(.+)$/);
          if (match) {
            const name = match[1].replace(/^origin\//, "").replace(/^remotes\/origin\//, "");
            if (!name.includes("tag: ") && !name.includes("HEAD")) {
              branchName = name;
              break;
            }
          }
        }
      }

      // If we found a branch tip, all its ancestors (until a merge or another tip)
      // belong to this branch. In a simple log, the next commit is usually the parent.
      if (branchName) {
          const parentHashes = parents ? parents.split(" ") : [];
          parentHashes.forEach(p => activeBranchMap.set(p, branchName!));
      } else {
          // Inherit branch from child
          branchName = activeBranchMap.get(hash);
          const parentHashes = parents ? parents.split(" ") : [];
          if (branchName) {
              parentHashes.forEach(p => activeBranchMap.set(p, branchName!));
          }
      }

      return {
        hash,
        shortHash: hash.substring(0, 7),
        parents: parents ? parents.split(" ") : [],
        message: subject,
        shortMessage: subject.split("\n")[0],
        type: this.getCommitType(subject),
        author: {
          name: author,
          email,
          avatarUrl: this.getAvatarUrl(email),
        },
        committer: {
          name: author,
          email,
          avatarUrl: this.getAvatarUrl(email),
        },
        timestamp: parseInt(timestamp),
        isMerge: parents ? parents.split(" ").length > 1 : false,
        isSquash: false,
        branchName,
        tags: tagMap.get(hash) || [],
      };
    });
  }

  private parseBranches(output: string): Branch[] {
    if (!output.trim()) return [];

    return output
      .trim()
      .split("\n")
      .map((line, index) => {
        const [name, objectName] = line.split("|");
        const isRemote = name.startsWith("remotes/");
        return {
          name: name.replace(/^remotes\/[^/]+\//, ""), // remove remote prefix
          type: this.getBranchType(name),
          objectName,
          isHead: false, // Will be determined later
          isLocal: !isRemote,
          isRemote,
          color: this.getBranchColor(name),
          lane: index,
        };
      });
  }

  private getCommitType(message: string): any {
    if (message.toLowerCase().startsWith("revert")) return "revert";

    const match = message.match(/^(\w+)(?:\(.+\))?:/);
    if (!match) return "other";

    const type = match[1].toLowerCase();
    const validTypes = [
      "feat",
      "fix",
      "docs",
      "style",
      "refactor",
      "perf",
      "test",
      "chore",
      "revert",
    ];
    return validTypes.includes(type) ? type : "other";
  }

  private getBranchType(name: string): any {
    // Clean name by removing remotes/ and origin/ prefixes for classification
    const cleanName = name
      .replace(/^remotes\//, "")
      .replace(/^origin\//, "")
      .replace(/^[^/]+\//, (match) => {
        // If it still looks like a remote (e.g., 'upstream/'), remove it
        const commonRemotes = ["origin/", "upstream/", "github/"];
        return commonRemotes.includes(match) ? "" : match;
      });

    if (cleanName === "main" || cleanName === "master") return "main";
    if (cleanName === "develop" || cleanName === "dev") return "develop";
    if (cleanName.startsWith("feature/")) return "feature";
    if (cleanName.startsWith("release/")) return "release";
    if (cleanName.startsWith("hotfix/")) return "hotfix";
    return "custom";
  }

  private getBranchColor(name: string): string {
    const type = this.getBranchType(name);
    
    // Fixed colors for primary branches
    if (type === "main") return "#1f2937";
    if (type === "develop") return "#059669";
    if (type === "hotfix") return "#ea580c";
    if (type === "release") return "#dc2626";

    // Dynamic colors for features and custom branches to make them distinguishable
    const palette = [
      "#2563eb", // blue
      "#7c3aed", // violet
      "#db2777", // pink
      "#0891b2", // cyan
      "#4f46e5", // indigo
      "#9333ea", // purple
      "#22c55e", // green
      "#eab308", // yellow
      "#f97316", // orange
    ];

    // Simple hash to pick a stable color from the palette
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palette.length;
    return palette[index];
  }
}
