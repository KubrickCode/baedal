import { ValidationError } from "../../internal/core/errors/";
import { createGitHubClient, GitHubClient } from "./github";
import { GIT_FILE_MODES } from "./types";

describe("GitHubClient", () => {
  describe("constructor", () => {
    it("should create GitHubClient instance with valid token", () => {
      const client = new GitHubClient("valid-token");
      expect(client).toBeInstanceOf(GitHubClient);
    });
  });

  describe("instance methods", () => {
    it("should have createBranch method", () => {
      const client = new GitHubClient("valid-token");
      expect(typeof client.createBranch).toBe("function");
    });

    it("should have createCommit method", () => {
      const client = new GitHubClient("valid-token");
      expect(typeof client.createCommit).toBe("function");
    });

    it("should have createPullRequest method", () => {
      const client = new GitHubClient("valid-token");
      expect(typeof client.createPullRequest).toBe("function");
    });

    it("should have createTree method", () => {
      const client = new GitHubClient("valid-token");
      expect(typeof client.createTree).toBe("function");
    });

    it("should have getDefaultBranch method", () => {
      const client = new GitHubClient("valid-token");
      expect(typeof client.getDefaultBranch).toBe("function");
    });

    it("should have getLatestCommitSha method", () => {
      const client = new GitHubClient("valid-token");
      expect(typeof client.getLatestCommitSha).toBe("function");
    });

    it("should have pushFilesAndCreatePR method", () => {
      const client = new GitHubClient("valid-token");
      expect(typeof client.pushFilesAndCreatePR).toBe("function");
    });

    it("should have updateBranchRef method", () => {
      const client = new GitHubClient("valid-token");
      expect(typeof client.updateBranchRef).toBe("function");
    });
  });
});

describe("createGitHubClient", () => {
  describe("error cases", () => {
    it("should throw ValidationError for missing token", () => {
      expect(() => createGitHubClient("")).toThrow(ValidationError);
    });

    it("should throw ValidationError for empty token", () => {
      expect(() => createGitHubClient("")).toThrow("GitHub token is required");
    });

    it("should throw ValidationError for whitespace-only token", () => {
      expect(() => createGitHubClient("   ")).toThrow(ValidationError);
    });

    it("should throw ValidationError for whitespace-only token with message", () => {
      expect(() => createGitHubClient("   ")).toThrow("GitHub token is required");
    });

    it("should include token usage hints in error message", () => {
      try {
        createGitHubClient("");
        expect.fail("Expected createGitHubClient to throw an error.");
      } catch (e) {
        if (!(e instanceof Error)) {
          expect.fail("Expected an Error to be thrown");
        }
        expect(e.message).toMatch(/GitHub token is required/);
        expect(e.message).toMatch(/token.*field.*push configuration file/);
      }
    });

    it("should throw ValidationError with correct properties", () => {
      try {
        createGitHubClient("");
        expect.fail("Expected createGitHubClient to throw an error.");
      } catch (e) {
        expect(e).toBeInstanceOf(ValidationError);
        if (e instanceof ValidationError) {
          expect(e.code).toBe("VALIDATION_ERROR");
          expect(e.name).toBe("ValidationError");
        }
      }
    });
  });

  describe("success cases", () => {
    it("should create GitHubClient with valid token", () => {
      const client = createGitHubClient("ghp_valid_token_123");
      expect(client).toBeDefined();
      expect(client).toHaveProperty("createBranch");
      expect(client).toHaveProperty("createCommit");
      expect(client).toHaveProperty("createPullRequest");
    });

    it("should create GitHubClient with all required methods", () => {
      const client = createGitHubClient("ghp_valid_token_123");
      expect(client).toHaveProperty("createTree");
      expect(client).toHaveProperty("getDefaultBranch");
      expect(client).toHaveProperty("getLatestCommitSha");
      expect(client).toHaveProperty("pushFilesAndCreatePR");
      expect(client).toHaveProperty("updateBranchRef");
    });

    it("should return GitHubClient instance", () => {
      const client = createGitHubClient("ghp_valid_token_123");
      expect(client).toBeInstanceOf(GitHubClient);
    });

    it("should accept token with spaces (trimmed)", () => {
      const client = createGitHubClient("  ghp_valid_token_123  ");
      expect(client).toBeInstanceOf(GitHubClient);
    });
  });
});

describe("GIT_FILE_MODES", () => {
  it("should have NORMAL mode", () => {
    expect(GIT_FILE_MODES.NORMAL).toBe("100644");
  });

  it("should have EXECUTABLE mode", () => {
    expect(GIT_FILE_MODES.EXECUTABLE).toBe("100755");
  });
});
