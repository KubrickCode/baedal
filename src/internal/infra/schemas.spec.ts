import { NetworkError } from "../core/errors/index.js";
import { GitHubRepositorySchema, parseGitHubResponse } from "./schemas";

describe("GitHubRepositorySchema", () => {
  describe("valid data", () => {
    it("should parse valid GitHub repository response", () => {
      const validData = { default_branch: "main" };
      const result = GitHubRepositorySchema.parse(validData);

      expect(result).toEqual(validData);
    });

    it("should parse response with additional fields", () => {
      const dataWithExtraFields = {
        default_branch: "develop",
        id: 123,
        name: "test-repo",
      };
      const result = GitHubRepositorySchema.parse(dataWithExtraFields);

      expect(result).toEqual({ default_branch: "develop" });
    });
  });

  describe("invalid data", () => {
    it("should reject data without default_branch", () => {
      const invalidData = { id: 123 };
      const result = GitHubRepositorySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject empty default_branch", () => {
      const invalidData = { default_branch: "" };
      const result = GitHubRepositorySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it("should reject non-string default_branch", () => {
      const invalidData = { default_branch: 123 };
      const result = GitHubRepositorySchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });
});

describe("parseGitHubResponse", () => {
  describe("successful parsing", () => {
    it("should return parsed data for valid input", () => {
      const validData = { default_branch: "main" };
      const result = parseGitHubResponse(GitHubRepositorySchema, validData, "GET /repos/user/repo");

      expect(result).toEqual(validData);
    });
  });

  describe("parsing errors", () => {
    it("should throw NetworkError for invalid data", () => {
      const invalidData = { id: 123 };

      expect(() =>
        parseGitHubResponse(GitHubRepositorySchema, invalidData, "GET /repos/user/repo")
      ).toThrow(NetworkError);
    });

    it("should include context in error message", () => {
      const invalidData = { id: 123 };

      expect(() =>
        parseGitHubResponse(GitHubRepositorySchema, invalidData, "GET /repos/user/repo")
      ).toThrow(/GET \/repos\/user\/repo/);
    });

    it("should include validation details in error message", () => {
      const invalidData = { default_branch: "" };

      expect(() =>
        parseGitHubResponse(GitHubRepositorySchema, invalidData, "GET /repos/user/repo")
      ).toThrow(/default_branch/);
    });

    it("should have NETWORK_ERROR error code", () => {
      const invalidData = { id: 123 };

      try {
        parseGitHubResponse(GitHubRepositorySchema, invalidData, "GET /repos/user/repo");
        fail("Expected parseGitHubResponse to throw an error");
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkError);
        if (error instanceof NetworkError) {
          expect(error.code).toBe("NETWORK_ERROR");
        }
      }
    });
  });
});
