import { ValidationError } from "../../internal/core/errors/";
import { getArchiveUrl, getDefaultBranch } from "./archive";

describe("getDefaultBranch", () => {
  describe("error cases", () => {
    it("should throw ValidationError for unsupported provider", async () => {
      await expect(getDefaultBranch("owner", "repo", "gitlab" as "github")).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError with provider name in message", async () => {
      await expect(getDefaultBranch("owner", "repo", "bitbucket" as "github")).rejects.toThrow(
        "Unsupported provider: bitbucket"
      );
    });
  });
});

describe("getArchiveUrl", () => {
  it("should generate GitHub tarball URL", () => {
    const url = getArchiveUrl({
      branch: "main",
      owner: "octocat",
      provider: "github",
      repo: "hello-world",
    });

    expect(url).toBe("https://codeload.github.com/octocat/hello-world/tar.gz/main");
  });

  it("should handle different branches", () => {
    const url = getArchiveUrl({
      branch: "develop",
      owner: "user",
      provider: "github",
      repo: "project",
    });

    expect(url).toBe("https://codeload.github.com/user/project/tar.gz/develop");
  });

  it("should construct proper GitHub download URL", () => {
    const url = getArchiveUrl({
      branch: "feature/test",
      owner: "my-org",
      provider: "github",
      repo: "my-repo",
    });

    expect(url).toBe("https://codeload.github.com/my-org/my-repo/tar.gz/feature/test");
  });

  it("should handle special characters in branch names", () => {
    const url = getArchiveUrl({
      branch: "fix/issue-123",
      owner: "owner",
      provider: "github",
      repo: "repo",
    });

    expect(url).toBe("https://codeload.github.com/owner/repo/tar.gz/fix/issue-123");
  });

  it("should throw ValidationError for unsupported provider", () => {
    expect(() => {
      getArchiveUrl({
        branch: "main",
        owner: "octocat",
        provider: "gitlab" as any,
        repo: "hello-world",
      });
    }).toThrow(ValidationError);

    expect(() => {
      getArchiveUrl({
        branch: "main",
        owner: "octocat",
        provider: "gitlab" as any,
        repo: "hello-world",
      });
    }).toThrow("Unsupported provider: gitlab");
  });
});
