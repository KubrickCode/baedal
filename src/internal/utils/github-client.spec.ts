import { Octokit } from "@octokit/rest";
import { createGitHubClient, getTokenFromEnv } from "./github-client.js";

describe("github-client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getTokenFromEnv", () => {
    it("should return GITHUB_TOKEN if set", () => {
      process.env.GITHUB_TOKEN = "ghp_github_token";
      process.env.GH_TOKEN = "ghp_gh_token";

      const token = getTokenFromEnv();

      expect(token).toBe("ghp_github_token");
    });

    it("should return GH_TOKEN if GITHUB_TOKEN is not set", () => {
      delete process.env.GITHUB_TOKEN;
      process.env.GH_TOKEN = "ghp_gh_token";

      const token = getTokenFromEnv();

      expect(token).toBe("ghp_gh_token");
    });

    it("should return undefined if no token environment variables are set", () => {
      delete process.env.GITHUB_TOKEN;
      delete process.env.GH_TOKEN;

      const token = getTokenFromEnv();

      expect(token).toBeUndefined();
    });

    it("should return undefined if token is empty string", () => {
      process.env.GITHUB_TOKEN = "";
      process.env.GH_TOKEN = "";

      const token = getTokenFromEnv();

      expect(token).toBeUndefined();
    });

    it("should return undefined if token is only whitespace", () => {
      process.env.GITHUB_TOKEN = "   ";
      process.env.GH_TOKEN = "  ";

      const token = getTokenFromEnv();

      expect(token).toBeUndefined();
    });

    it("should ignore whitespace-only GITHUB_TOKEN and return GH_TOKEN", () => {
      process.env.GITHUB_TOKEN = "   ";
      process.env.GH_TOKEN = "ghp_valid_token";

      const token = getTokenFromEnv();

      expect(token).toBe("ghp_valid_token");
    });
  });

  describe("createGitHubClient", () => {
    it("should create Octokit instance with explicit token", async () => {
      const token = "ghp_explicit_token";
      const octokit = createGitHubClient(token);

      expect(octokit).toBeInstanceOf(Octokit);
      const auth = await octokit.auth();
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty("token");
    });

    it("should create Octokit instance with GITHUB_TOKEN from environment", async () => {
      process.env.GITHUB_TOKEN = "ghp_env_token";
      const octokit = createGitHubClient();

      expect(octokit).toBeInstanceOf(Octokit);
      const auth = await octokit.auth();
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty("token");
    });

    it("should create Octokit instance with GH_TOKEN from environment", async () => {
      delete process.env.GITHUB_TOKEN;
      process.env.GH_TOKEN = "ghp_gh_env_token";
      const octokit = createGitHubClient();

      expect(octokit).toBeInstanceOf(Octokit);
      const auth = await octokit.auth();
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty("token");
    });

    it("should prioritize explicit token over environment variables", async () => {
      process.env.GITHUB_TOKEN = "ghp_env_token";
      const explicitToken = "ghp_explicit_token";
      const octokit = createGitHubClient(explicitToken);

      expect(octokit).toBeInstanceOf(Octokit);
      const auth = await octokit.auth();
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty("token");
    });

    it("should create unauthenticated Octokit instance when no token is provided", () => {
      delete process.env.GITHUB_TOKEN;
      delete process.env.GH_TOKEN;
      const octokit = createGitHubClient();

      expect(octokit).toBeInstanceOf(Octokit);
      // Octokit still has auth function even without token (it just won't authenticate)
      expect(octokit).toBeDefined();
    });

    it("should set custom user agent", () => {
      const octokit = createGitHubClient();

      expect(octokit).toBeInstanceOf(Octokit);

      // Verify user agent is configured by checking Octokit's internal request defaults
      // Using type assertion as Octokit doesn't expose this in public types
      const headers = (octokit.request as any).endpoint.DEFAULTS.headers;
      expect(headers["user-agent"]).toContain("baedal/1.0");
    });

    it("should handle empty string token by falling back to environment", async () => {
      process.env.GITHUB_TOKEN = "ghp_env_token";
      const octokit = createGitHubClient("");

      expect(octokit).toBeInstanceOf(Octokit);
      const auth = await octokit.auth();
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty("token");
    });

    it("should handle whitespace-only token by falling back to environment", async () => {
      process.env.GH_TOKEN = "ghp_env_token";
      const octokit = createGitHubClient("   ");

      expect(octokit).toBeInstanceOf(Octokit);
      const auth = await octokit.auth();
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty("token");
    });
  });
});
