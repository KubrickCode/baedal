import { ValidationError } from "../../internal/core/errors/";
import { createGitHubClient } from "./github";

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
        fail("Expected createGitHubClient to throw an error.");
      } catch (e) {
        if (!(e instanceof Error)) {
          fail("Expected an Error to be thrown");
        }
        expect(e.message).toMatch(/GitHub token is required/);
        expect(e.message).toMatch(/token.*field.*push configuration file/);
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
  });
});
