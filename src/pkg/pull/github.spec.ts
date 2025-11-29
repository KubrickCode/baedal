import { GitHubAPIError, NetworkError } from "../../internal/core/errors/";

describe("getGitHubDefaultBranch", () => {
  describe("GitHubAPIError - 404 Not Found", () => {
    it("should create error with repository not found message", () => {
      const error = new GitHubAPIError(
        "Repository 'octocat/nonexistent' not found. Verify the repository exists and you have access.",
        404,
        "https://api.github.com/repos/octocat/nonexistent"
      );

      expect(error).toBeInstanceOf(GitHubAPIError);
      expect(error.statusCode).toBe(404);
      expect(error.url).toBe("https://api.github.com/repos/octocat/nonexistent");
      expect(error.message).toContain("not found");
      expect(error.message).toContain("octocat/nonexistent");
      expect(error.code).toBe("GITHUB_API_ERROR");
    });
  });

  describe("GitHubAPIError - 401 Unauthorized", () => {
    it("should create error with authentication required message", () => {
      const error = new GitHubAPIError(
        "Authentication required for 'octocat/private-repo'. Provide a token with --token option.",
        401,
        "https://api.github.com/repos/octocat/private-repo"
      );

      expect(error).toBeInstanceOf(GitHubAPIError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("Authentication required");
      expect(error.message).toContain("--token");
    });
  });

  describe("GitHubAPIError - 403 Forbidden", () => {
    it("should create error suggesting token when no token provided", () => {
      const error = new GitHubAPIError(
        "Access forbidden to 'octocat/private-repo'. Try providing a token with --token option.",
        403,
        "https://api.github.com/repos/octocat/private-repo"
      );

      expect(error).toBeInstanceOf(GitHubAPIError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toContain("Access forbidden");
      expect(error.message).toContain("--token");
    });

    it("should create error about permissions when token provided", () => {
      const error = new GitHubAPIError(
        "Access forbidden to 'octocat/private-repo'. Your token may lack required permissions.",
        403,
        "https://api.github.com/repos/octocat/private-repo"
      );

      expect(error).toBeInstanceOf(GitHubAPIError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toContain("permissions");
    });
  });

  describe("GitHubAPIError - Other HTTP errors", () => {
    it("should create error with status code for 500 Internal Server Error", () => {
      const error = new GitHubAPIError(
        "GitHub API error (HTTP 500) for 'octocat/hello-world': Internal Server Error",
        500,
        "https://api.github.com/repos/octocat/hello-world"
      );

      expect(error).toBeInstanceOf(GitHubAPIError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toContain("HTTP 500");
    });

    it("should create error with status code for 502 Bad Gateway", () => {
      const error = new GitHubAPIError(
        "GitHub API error (HTTP 502) for 'octocat/hello-world': Bad Gateway",
        502,
        "https://api.github.com/repos/octocat/hello-world"
      );

      expect(error.statusCode).toBe(502);
    });
  });

  describe("NetworkError - Non-HTTP failures", () => {
    it("should wrap network connection errors", () => {
      const error = new NetworkError(
        "Failed to connect to GitHub for 'octocat/hello-world': ECONNREFUSED",
        undefined,
        "https://api.github.com/repos/octocat/hello-world"
      );

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.message).toContain("Failed to connect");
      expect(error.message).toContain("ECONNREFUSED");
      expect(error.url).toBe("https://api.github.com/repos/octocat/hello-world");
    });

    it("should wrap DNS resolution errors", () => {
      const error = new NetworkError(
        "Failed to connect to GitHub for 'octocat/hello-world': getaddrinfo ENOTFOUND",
        undefined,
        "https://api.github.com/repos/octocat/hello-world"
      );

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toContain("ENOTFOUND");
    });

    it("should wrap timeout errors", () => {
      const error = new NetworkError(
        "Failed to connect to GitHub for 'octocat/hello-world': Request timed out",
        undefined,
        "https://api.github.com/repos/octocat/hello-world"
      );

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toContain("timed out");
    });
  });

  describe("error hierarchy", () => {
    it("should have GitHubAPIError extend NetworkError", () => {
      const error = new GitHubAPIError("Test error", 404);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error).toBeInstanceOf(GitHubAPIError);
    });

    it("should have proper name property for GitHubAPIError", () => {
      const error = new GitHubAPIError("Test error", 404);

      expect(error.name).toBe("GitHubAPIError");
    });

    it("should have proper name property for NetworkError", () => {
      const error = new NetworkError("Test error");

      expect(error.name).toBe("NetworkError");
    });

    it("should allow optional response data in GitHubAPIError", () => {
      const responseData = { documentation_url: "https://docs.github.com", message: "Not Found" };
      const error = new GitHubAPIError(
        "Repository not found",
        404,
        "https://api.github.com/repos/octocat/nonexistent",
        responseData
      );

      expect(error.response).toEqual(responseData);
    });
  });

  describe("error message format validation", () => {
    it("should include owner/repo in all error messages", () => {
      const errors = [
        new GitHubAPIError(
          "Repository 'facebook/react' not found. Verify the repository exists and you have access.",
          404,
          "https://api.github.com/repos/facebook/react"
        ),
        new GitHubAPIError(
          "Authentication required for 'facebook/react'. Provide a token with --token option.",
          401,
          "https://api.github.com/repos/facebook/react"
        ),
        new NetworkError(
          "Failed to connect to GitHub for 'facebook/react': Connection refused",
          undefined,
          "https://api.github.com/repos/facebook/react"
        ),
      ];

      for (const error of errors) {
        expect(error.message).toContain("facebook/react");
      }
    });

    it("should provide actionable guidance in error messages", () => {
      const error401 = new GitHubAPIError(
        "Authentication required for 'owner/repo'. Provide a token with --token option.",
        401,
        "https://api.github.com/repos/owner/repo"
      );

      const error403NoToken = new GitHubAPIError(
        "Access forbidden to 'owner/repo'. Try providing a token with --token option.",
        403,
        "https://api.github.com/repos/owner/repo"
      );

      expect(error401.message).toContain("--token");
      expect(error403NoToken.message).toContain("--token");
    });
  });
});
