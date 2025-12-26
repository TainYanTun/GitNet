import { execSync } from "child_process";
import { Repository, Commit, Branch, FileChange, CommitParent, CommitType, BranchType } from "../../shared/types";

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
        const [hash, parentsHashes, author, email, timestamp, ...messageParts] =
          line.split("|");
        const message = messageParts.join("|");

        const parentsDetails: CommitParent[] = parentsHashes
          ? parentsHashes.split(" ").map((pHash) => ({
              hash: pHash,
              shortHash: pHash.substring(0, 7),
            }))
          : [];

        return {
          hash,
          shortHash: hash.substring(0, 7),
          parentsDetails,
          message,
          shortMessage: message.split("\n")[0],
          type: this.getCommitType(message),
          author: { name: author, email },
          committer: { name: author, email },
          timestamp: parseInt(timestamp),
          isMerge: parentsHashes ? parentsHashes.split(" ").length > 1 : false,
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

  // --- New methods for detailed commit info ---

  public async getCommitDetails(repoPath: string, commitHash: string): Promise<Commit> {
    const command = `git log -n 1 --pretty=format:'%H|%P|%an|%ae|%ct|%s' ${commitHash}`;
    let commit: Commit | null = null;
    try {
      const output = execSync(command, { cwd: repoPath, encoding: "utf8" });
      const [hash, parentsHashes, author, email, timestamp, ...messageParts] =
        output.trim().split("|");
      const message = messageParts.join("|");

      const parentsDetails: CommitParent[] = parentsHashes
        ? parentsHashes.split(" ").map((pHash) => ({
            hash: pHash,
            shortHash: pHash.substring(0, 7),
          }))
        : [];

      commit = {
        hash,
        shortHash: hash.substring(0, 7),
        parentsDetails,
        message,
        shortMessage: message.split("\n")[0],
        type: this.getCommitType(message),
        author: { name: author, email },
        committer: { name: author, email },
        timestamp: parseInt(timestamp),
        isMerge: parentsHashes ? parentsHashes.split(" ").length > 1 : false,
        isSquash: false,
      };
    } catch (error) {
      console.error(
        `Failed to get details for commit ${commitHash} in ${repoPath}:`,
        error,
      );
      throw new Error(`Commit ${commitHash} not found or inaccessible.`);
    }

    if (!commit) {
      throw new Error(`Commit ${commitHash} not found.`);
    }

    const fileChanges = await this.getCommitFileChanges(repoPath, commitHash);
    const { branches, tags } = await this.getBranchesAndTagsContainingCommit(
      repoPath,
      commitHash,
    );

    return {
      ...commit,
      fileChanges,
      branches,
      tags,
      children: await this.getChildrenOfCommit(repoPath, commitHash),
      stats: await this.getCommitStats(repoPath, commitHash),
    };
  }

  public async getCommitStats(
    repoPath: string,
    commitHash: string,
  ): Promise<CommitStats | undefined> {
    try {
      const parentHash = await this.getCommitParent(repoPath, commitHash);
      if (!parentHash) {
        // For initial commit, get stats relative to empty tree
        const output = execSync(
          `git diff --shortstat 4b825dc642cb6eb9a060e54bf8d69288fbee4904 ${commitHash}`,
          { cwd: repoPath, encoding: "utf8" },
        ).trim();
        return this.parseShortStat(output);
      }
      const output = execSync(
        `git diff --shortstat ${parentHash} ${commitHash}`,
        { cwd: repoPath, encoding: "utf8" },
      ).trim();
      return this.parseShortStat(output);
    } catch (error) {
      console.warn(
        `Could not get stats for commit ${commitHash} in ${repoPath}:`,
        error,
      );
      return undefined;
    }
  }

  private async getCommitParent(repoPath: string, commitHash: string): Promise<string | undefined> {
    try {
      const output = execSync(`git rev-parse ${commitHash}^`, { cwd: repoPath, encoding: "utf8" }).trim();
      return output;
    } catch {
      return undefined; // No parent (initial commit)
    }
  }

  private parseShortStat(output: string): CommitStats | undefined {
    const match = output.match(/(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/);
    if (match) {
      const filesChanged = parseInt(match[1]) || 0;
      const insertions = parseInt(match[2]) || 0;
      const deletions = parseInt(match[3]) || 0;
      return {
        additions: insertions,
        deletions: deletions,
        total: filesChanged,
      };
    }
    return undefined;
  }


  async getCommitFileChanges(
    repoPath: string,
    commitHash: string,
  ): Promise<FileChange[]> {
    try {
      const output = execSync(
        `git diff-tree --no-commit-id --name-status -r ${commitHash}`,
        { cwd: repoPath, encoding: "utf8" },
      ).trim();

      if (!output) return [];

      return output.split("\n").map((line) => {
        const [status, path, previousPath] = line.split("\t");
        return {
          status: status as FileChange["status"],
          path,
          previousPath: previousPath || undefined,
        };
      });
    } catch (error) {
      console.error(
        `Failed to get file changes for commit ${commitHash} in ${repoPath}:`,
        error,
      );
      return [];
    }
  }

  async getBranchesAndTagsContainingCommit(
    repoPath: string,
    commitHash: string,
  ): Promise<{ branches: string[]; tags: string[] }> {
    let branches: string[] = [];
    let tags: string[] = [];

    try {
      const branchOutput = execSync(
        `git branch --contains ${commitHash} --format='%(refname:short)'`,
        { cwd: repoPath, encoding: "utf8" },
      ).trim();
      branches = branchOutput
        .split("\n")
        .map((b) => b.trim())
        .filter((b) => b.length > 0 && !b.includes("->")); // Filter out detached HEAD
    } catch (error) {
      console.warn(
        `Could not get branches for commit ${commitHash} in ${repoPath}:`,
        error,
      );
    }

    try {
      const tagOutput = execSync(
        `git tag --contains ${commitHash} --sort=-v:refname`,
        { cwd: repoPath, encoding: "utf8" },
      ).trim();
      tags = tagOutput
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    } catch (error) {
      console.warn(
        `Could not get tags for commit ${commitHash} in ${repoPath}:`,
        error,
      );
    }

    return { branches, tags };
  }

  public async getChildrenOfCommit(repoPath: string, commitHash: string): Promise<CommitParent[]> {
    try {
      // Using --children to list actual children, then filter out the commit itself
      const output = execSync(`git rev-list --parents ${commitHash}^@`, { cwd: repoPath, encoding: "utf8" }).trim();
      // The command above might not be precise for direct children.
      // A more reliable way is to find all commits, and for each commit, check if its parent is `commitHash`.
      // For simplicity and performance, we'll try to find commits whose parent is this commit.
      // This is not a direct git command, but a logical deduction.

      // Alternative: get all commits and build a parent-child map
      // For now, let's keep it simple and focus on the current commit's direct children.
      // A direct way to get children is not readily available in a single git command like parents.

      // Let's go with a simpler approach for finding children, which might involve iterating through commits.
      // For this method, we will consider the commits that have this commit as a direct parent.
      // This requires fetching a wider range of commits, or a different git plumbing command.

      // For now, a simplified approach. Get all commits and build parent-child map
      // This might be better done by the client-side logic after fetching all commits for the graph.

      // Given the constraints of returning a Promise<CommitParent[]>,
      // and without fetching the entire repo history here, a direct 'git' command for *children* is tricky.
      // `git log --all --grep=<parent-hash>` or equivalent. This is not efficient.

      // For this specific task, if "children" means "commits that have this commit as a direct parent"
      // the git command would involve parsing many `git log` outputs or building a graph.

      // As per previous discussion, `git rev-list --children` is not for direct children.
      // For now, I will return an empty array for children until a more efficient
      // and direct Git command can be identified or a graph-building approach implemented.
      return [];

    } catch (error) {
      console.warn(
        `Could not get children for commit ${commitHash} in ${repoPath}:`,
        error,
      );
      return [];
    }
  }

  private getCommitType(message: string): CommitType {
    const match = message.match(/^(\w+)(?:\(.+\))?:/);
    if (!match) return "other";

    const type = match[1].toLowerCase();
    const validTypes: CommitType[] = [
      "feat",
      "fix",
      "docs",
      "style",
      "refactor",
      "perf",
      "test",
      "chore",
    ];
    return validTypes.includes(type as CommitType) ? (type as CommitType) : "other";
  }

  private getBranchType(name: string): BranchType {
    if (name === "main" || name === "master") return "main";
    if (name === "develop" || name === "dev") return "develop";
    if (name.startsWith("feature/")) return "feature";
    if (name.startsWith("release/")) return "release";
    if (name.startsWith("hotfix/")) return "hotfix";
    return "custom";
  }

  private getBranchColor(name: string): string {
    const type = this.getBranchType(name);
    const colors: Record<BranchType, string> = {
      main: "#1f2937",
      develop: "#059669",
      feature: "#2563eb",
      release: "#dc2626",
      hotfix: "#ea580c",
      custom: "#7c3aed",
    };
    return colors[type];
  }
}
