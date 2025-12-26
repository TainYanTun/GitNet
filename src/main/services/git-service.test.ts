import { GitService } from './git-service';
import { expect, test } from "bun:test";

test("getCommitType", () => {
  const gitService = new (GitService as any)();
  expect(gitService.getCommitType("feat: new feature")).toBe("feat");
  expect(gitService.getCommitType("fix: bug fix")).toBe("fix");
  expect(gitService.getCommitType("docs: documentation")).toBe("docs");
  expect(gitService.getCommitType("style: styling")).toBe("style");
  expect(gitService.getCommitType("refactor: refactoring")).toBe("refactor");
  expect(gitService.getCommitType("perf: performance")).toBe("perf");
  expect(gitService.getCommitType("test: testing")).toBe("test");
  expect(gitService.getCommitType("chore: chore")).toBe("chore");
  expect(gitService.getCommitType("revert: revert something")).toBe("other");
  expect(gitService.getCommitType("unknown: unknown type")).toBe("other");
  expect(gitService.getCommitType("no type")).toBe("other");
});

test("getBranchType", () => {
  const gitService = new (GitService as any)();
  expect(gitService.getBranchType("main")).toBe("main");
  expect(gitService.getBranchType("master")).toBe("main");
  expect(gitService.getBranchType("develop")).toBe("develop");
  expect(gitService.getBranchType("dev")).toBe("develop");
  expect(gitService.getBranchType("feature/new-feature")).toBe("feature");
  expect(gitService.getBranchType("release/v1.0.0")).toBe("release");
  expect(gitService.getBranchType("hotfix/bug-fix")).toBe("hotfix");
  expect(gitService.getBranchType("random-branch")).toBe("custom");
});
