import { parseSource } from "./parser";

describe("parseSource", () => {
  describe("basic format (user/repo)", () => {
    it("should parse user/repo format correctly", async () => {
      const result = await parseSource("octocat/hello-world");
      expect(result).toEqual({
        owner: "octocat",
        provider: "github",
        repo: "hello-world",
      });
    });

    it("should parse user/repo with subdirectory", async () => {
      const result = await parseSource("octocat/hello-world/src/components");
      expect(result).toEqual({
        owner: "octocat",
        provider: "github",
        repo: "hello-world",
        subdir: "src/components",
      });
    });

    it("should parse user/repo with nested subdirectory", async () => {
      const result = await parseSource("octocat/hello-world/a/b/c/d");
      expect(result).toEqual({
        owner: "octocat",
        provider: "github",
        repo: "hello-world",
        subdir: "a/b/c/d",
      });
    });
  });

  describe("github: prefix format", () => {
    it("should parse github:user/repo format", async () => {
      const result = await parseSource("github:octocat/hello-world");
      expect(result).toEqual({
        owner: "octocat",
        provider: "github",
        repo: "hello-world",
      });
    });

    it("should parse github:user/repo with subdirectory", async () => {
      const result = await parseSource("github:octocat/hello-world/src");
      expect(result).toEqual({
        owner: "octocat",
        provider: "github",
        repo: "hello-world",
        subdir: "src",
      });
    });
  });

  describe("GitHub URL format", () => {
    it("should parse HTTPS GitHub URL", async () => {
      const result = await parseSource("https://github.com/octocat/hello-world");
      expect(result).toEqual({
        owner: "octocat",
        provider: "github",
        repo: "hello-world",
      });
    });

    it("should parse HTTP GitHub URL", async () => {
      const result = await parseSource("http://github.com/octocat/hello-world");
      expect(result).toEqual({
        owner: "octocat",
        provider: "github",
        repo: "hello-world",
      });
    });

    it("should parse GitHub URL with subdirectory", async () => {
      const result = await parseSource("https://github.com/octocat/hello-world/tree/main/src");
      expect(result).toEqual({
        owner: "octocat",
        provider: "github",
        repo: "hello-world",
        subdir: "tree/main/src",
      });
    });
  });

  describe("error cases", () => {
    it("should throw error for invalid format (no repo)", async () => {
      await expect(parseSource("octocat")).rejects.toThrow("Invalid source format");
    });

    it("should throw error for empty string", async () => {
      await expect(parseSource("")).rejects.toThrow("Invalid source format");
    });

    it("should throw error for single slash", async () => {
      await expect(parseSource("/")).rejects.toThrow("Invalid source format");
    });

    it("should throw error for github: prefix only", async () => {
      await expect(parseSource("github:")).rejects.toThrow("Invalid source format");
    });

    it("should throw error for URL without owner/repo", async () => {
      await expect(parseSource("https://github.com/")).rejects.toThrow("Invalid source format");
    });
  });

  describe("edge cases", () => {
    it("should handle repository name with hyphen", async () => {
      const result = await parseSource("my-org/my-repo-name");
      expect(result).toEqual({
        owner: "my-org",
        provider: "github",
        repo: "my-repo-name",
      });
    });

    it("should handle repository name with underscore", async () => {
      const result = await parseSource("my_org/my_repo");
      expect(result).toEqual({
        owner: "my_org",
        provider: "github",
        repo: "my_repo",
      });
    });

    it("should handle repository name with dots", async () => {
      const result = await parseSource("my.org/my.repo");
      expect(result).toEqual({
        owner: "my.org",
        provider: "github",
        repo: "my.repo",
      });
    });
  });
});
