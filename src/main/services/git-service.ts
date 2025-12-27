import { execSync } from "child_process";
import * as crypto from "crypto";
import {
  Repository,
  Commit,
  Branch,
  FileChange,
  CommitParent,
} from "../../shared/types";

export class GitService {
  private getAvatarUrl(email: string): string {
    const hash = crypto
      .createHash("md5")
      .update(email.trim().toLowerCase())
      .digest("hex");
    return `https://www.gravatar.com/avatar/${hash}?s=64&d=identicon`;
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
    const command = `git log --all --pretty=format:'%H|%P|%an|%ae|%ct|%s' --skip=${offset} -n ${limit}`;

    try {
      const branches = await this.getBranches(repoPath);
      const branchMap = new Map<string, string>();
      branches.forEach((branch) => {
        branchMap.set(branch.objectName, branch.name);
      });

      const output = execSync(command, { cwd: repoPath, encoding: "utf8" });
      return this.parseCommits(output, branchMap);
    } catch {
      return [];
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
  ): Commit[] {
    if (!output.trim()) return [];

    return output
      .trim()
      .split("\n")
      .map((line) => {
        const [hash, parents, author, email, timestamp, ...messageParts] =
          line.split("|");
        const message = messageParts.join("|");

        return {
          hash,
          shortHash: hash.substring(0, 7),
          parents: parents ? parents.split(" ") : [],
          message,
          shortMessage: message.split("\n")[0],
          type: this.getCommitType(message),
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
          branchName: branchMap.get(hash),
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
