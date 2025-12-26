import { execSync } from "child_process";
import { Repository, Commit, Branch, FileChange, CommitParent } from "../../shared/types";

export class GitService {
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
      message: subject, // subject is usually the first line
      shortMessage: subject.split('\n')[0],
      type: this.getCommitType(subject), // Re-using existing helper
      author: { name: authorName, email: authorEmail },
      committer: { name: authorName, email: authorEmail }, // Assuming committer is same for now
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
          author: { name: author, email },
          committer: { name: author, email },
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
    if (name === "main" || name === "master") return "main";
    if (name === "develop" || name === "dev") return "develop";
    if (name.startsWith("feature/")) return "feature";
    if (name.startsWith("release/")) return "release";
    if (name.startsWith("hotfix/")) return "hotfix";
    return "custom";
  }

  private getBranchColor(name: string): string {
    const type = this.getBranchType(name);
    const colors = {
      main: "#1f2937",
      develop: "#059669",
      feature: "#2563eb",
      release: "#dc2626",
      hotfix: "#ea580c",
      custom: "#7c3aed",
    };
    return colors[type as keyof typeof colors];
  }
}
