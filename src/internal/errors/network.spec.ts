import { BaseError } from "./base.js";
import { GitHubAPIError, NetworkError } from "./network.js";

describe("NetworkError", () => {
  it("should create NetworkError with message only", () => {
    const error = new NetworkError("Network connection failed");

    expect(error).toBeInstanceOf(NetworkError);
    expect(error).toBeInstanceOf(BaseError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Network connection failed");
    expect(error.code).toBe("NETWORK_ERROR");
    expect(error.name).toBe("NetworkError");
    expect(error.statusCode).toBeUndefined();
    expect(error.url).toBeUndefined();
  });

  it("should create NetworkError with status code and URL", () => {
    const error = new NetworkError("Request failed", 404, "https://api.github.com/repos/test/repo");

    expect(error.message).toBe("Request failed");
    expect(error.code).toBe("NETWORK_ERROR");
    expect(error.statusCode).toBe(404);
    expect(error.url).toBe("https://api.github.com/repos/test/repo");
  });

  it("should preserve stack trace", () => {
    const error = new NetworkError("Test error");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("NetworkError");
  });
});

describe("GitHubAPIError", () => {
  it("should create GitHubAPIError with message only", () => {
    const error = new GitHubAPIError("GitHub API rate limit exceeded");

    expect(error).toBeInstanceOf(GitHubAPIError);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error).toBeInstanceOf(BaseError);
    expect(error.message).toBe("GitHub API rate limit exceeded");
    expect(error.code).toBe("GITHUB_API_ERROR");
    expect(error.name).toBe("GitHubAPIError");
    expect(error.statusCode).toBeUndefined();
    expect(error.url).toBeUndefined();
    expect(error.response).toBeUndefined();
  });

  it("should create GitHubAPIError with all parameters", () => {
    const responseData = {
      documentation_url:
        "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting",
      message: "API rate limit exceeded",
    };

    const error = new GitHubAPIError(
      "Rate limit exceeded",
      403,
      "https://api.github.com/repos/test/repo",
      responseData
    );

    expect(error.message).toBe("Rate limit exceeded");
    expect(error.code).toBe("GITHUB_API_ERROR");
    expect(error.statusCode).toBe(403);
    expect(error.url).toBe("https://api.github.com/repos/test/repo");
    expect(error.response).toEqual(responseData);
  });

  it("should inherit NetworkError properties", () => {
    const error = new GitHubAPIError("Not found", 404, "https://api.github.com");

    expect(error.statusCode).toBe(404);
    expect(error.url).toBe("https://api.github.com");
  });
});
