import { execSync } from "child_process";
import { Repository, Commit, Branch } from "../../shared/types";

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
