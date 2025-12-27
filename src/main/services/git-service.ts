import { execSync } from "child_process";
import * as crypto from "crypto";
import {
  Repository,
  Commit,
  Branch,
  FileChange,
  CommitParent,
  HotFile,
  ContributorStats,
} from "../../shared/types";

export class GitService {
  private getAvatarUrl(email: string): string {
    const hash = crypto
      .createHash("md5")
      .update(email.trim().toLowerCase())
      .digest("hex");
    return `https://www.gravatar.com/avatar/${hash}?s=64&d=identicon`;
  }

  async getHotFiles(repoPath: string, limit = 10): Promise<HotFile[]> {
    try {
      // Use --all to get hotspots across all branches
      const output = execSync(
        `git log --all --format= --name-only | grep . | sort | uniq -c | sort -nr | head -n ${limit}`,
        { cwd: repoPath, encoding: "utf8" }
      );
      
      const lines = output.trim().split('\n').filter(line => line.trim().length > 0);
      
      return lines.map(line => {
        // Match: [spaces] [count] [spaces] [path]
        const match = line.trim().match(/^(\d+)\s+(.+)$/);
        if (match) {
          return {
            count: parseInt(match[1], 10),
            path: match[2].trim()
          };
        }
        return null;
      }).filter((f): f is HotFile => f !== null && f.count > 0);
    } catch (error) {
      console.error("HotFiles analysis failed:", error);
      return [];
    }
  }

  async getContributors(repoPath: string): Promise<ContributorStats[]> {
    try {
      // Use git log to get stats per author
      const command = `git log --all --pretty=format:'%an|%ae|%ct' --shortstat`;
      const output = execSync(command, { cwd: repoPath, encoding: "utf8" });
      
      const lines = output.split('\n');
      const statsMap = new Map<string, ContributorStats>();
      
      let currentAuthor: { name: string, email: string, timestamp: number } | null = null;
      
      // First pass: find project-wide bounds
      const allTimestamps = lines
        .filter(l => l.includes('|'))
        .map(l => parseInt(l.split('|')[2], 10));
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
      console.error("Failed to get contributors:", error);
      return [];
    }
  }
  async getRepository(path: string): Promise<Repository> {
    // Verify it's a Git repository
    try {
      execSync("git rev-parse --is-inside-work-tree", { cwd: path });
    } catch {
      throw new Error("Not a Git repository");
    }

    const name = path.split("/").pop() || "Unknown";
    const currentBranch = this.getCurrentBranch(path);
    const headCommit = await this.getCurrentHead(path);

    return {
      path,
      name,
      isValidGit: true,
      currentBranch,
      headCommit,
      branches: await this.getBranches(path),
      totalCommits: 0, // Will be calculated later
    };
  }

  async getCommits(
    repoPath: string,
    limit = 100,
    offset = 0,
  ): Promise<Commit[]> {
    const command = `git log --all --pretty=format:'%H|%P|%an|%ae|%ct|%s|%D' --skip=${offset} -n ${limit}`;

    try {
      const branches = await this.getBranches(repoPath);
      const branchMap = new Map<string, string>();
      branches.forEach((branch) => {
        branchMap.set(branch.objectName, branch.name);
      });

      const tagMap = await this.getTags(repoPath);

      const output = execSync(command, { cwd: repoPath, encoding: "utf8" });
      return this.parseCommits(output, branchMap, tagMap);
    } catch {
      return [];
    }
  }

  async getTags(repoPath: string): Promise<Map<string, string[]>> {
    try {
      const output = execSync(
        "git show-ref --tags --dereference",
        { cwd: repoPath, encoding: "utf8" }
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
      const output = execSync(
        "git branch -a --format='%(refname:short)|%(objectname)'",
        {
          cwd: repoPath,
          encoding: "utf8",
        },
      );
      return this.parseBranches(output);
    } catch {
      return [];
    }
  }

  async getCurrentHead(repoPath: string): Promise<string> {
    try {
      return execSync("git rev-parse HEAD", {
        cwd: repoPath,
        encoding: "utf8",
      }).trim();
    } catch {
      return "";
    }
  }

  async getStashList(repoPath: string): Promise<string[]> {
    try {
      const output = execSync("git stash list --pretty=format:'%gd: %gs'", {
        cwd: repoPath,
        encoding: "utf8",
      }).trim();
      return output.split("\n").filter((line) => line.length > 0);
    } catch (error) {
      // If there's no stash, git stash list returns an empty string and exits with 0.
      // If there's an actual error, log it.
      if (
        error instanceof Error &&
        !error.message.includes("No stashed changes found")
      ) {
        console.error("Failed to get stash list:", error);
      }
      return [];
    }
  }


  async getCommitDetails(repoPath: string, commitHash: string): Promise<Commit> {
    const command = `git show --pretty=format:'%H|%P|%an|%ae|%ad|%s' --numstat --date=raw ${commitHash}`;
    const tagCommand = `git tag --contains ${commitHash}`;
    const branchCommand = `git branch --contains ${commitHash} --format='%(refname:short)'`;

    try {
      const output = execSync(command, { cwd: repoPath, encoding: "utf8" });
      const tagsOutput = execSync(tagCommand, { cwd: repoPath, encoding: "utf8" });
      const branchesOutput = execSync(branchCommand, { cwd: repoPath, encoding: "utf8" });

      return this.parseDetailedCommit(output, tagsOutput, branchesOutput);
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
      // For a single commit, diff against its parent(s)
      const command = `git diff ${commitHash}^ ${commitHash} -- ${filePath}`;
      const output = execSync(command, { cwd: repoPath, encoding: "utf8" });
      return output;
    } catch (error) {
      console.error(`Failed to get diff for ${filePath} at commit ${commitHash}:`, error);
      throw error;
    }
  }

  private getCurrentBranch(repoPath: string): string {
    try {
      return execSync("git symbolic-ref --short HEAD", {
        cwd: repoPath,
        encoding: "utf8",
      }).trim();
    } catch {
      return "HEAD";
    }
  }

  private parseCommits(
    output: string,
    branchMap: Map<string, string>,
    tagMap: Map<string, string[]>,
  ): Commit[] {
    if (!output.trim()) return [];

    const commits: Commit[] = [];
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
            let name = match[1].replace(/^origin\//, "").replace(/^remotes\/origin\//, "");
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
