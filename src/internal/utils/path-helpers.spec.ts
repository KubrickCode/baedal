import { sep } from "node:path";
import { joinPathSafe, normalizeGitHubPath, stripRootDirectory } from "./path-helpers";

describe("stripRootDirectory", () => {
  describe("basic functionality", () => {
    it("should strip the root directory from a tarball path", () => {
      const result = stripRootDirectory("owner-repo-main/src/index.ts");
      expect(result).toBe("src/index.ts");
    });

    it("should handle nested directory structures", () => {
      const result = stripRootDirectory("owner-repo-main/src/utils/helpers/index.ts");
      expect(result).toBe("src/utils/helpers/index.ts");
    });

    it("should handle paths with single file in root", () => {
      const result = stripRootDirectory("owner-repo-main/README.md");
      expect(result).toBe("README.md");
    });
  });

  describe("edge cases", () => {
    it("should return empty string when only root directory is provided", () => {
      const result = stripRootDirectory("owner-repo-main/");
      expect(result).toBe("");
    });

    it("should return empty string when single segment without slash", () => {
      const result = stripRootDirectory("single-segment");
      expect(result).toBe("");
    });

    it("should return empty string for empty input", () => {
      const result = stripRootDirectory("");
      expect(result).toBe("");
    });

    it("should handle paths with trailing slashes", () => {
      const result = stripRootDirectory("owner-repo-main/src/utils/");
      expect(result).toBe("src/utils/");
    });

    it("should handle paths with multiple leading segments", () => {
      const result = stripRootDirectory("root/a/b/c/d");
      expect(result).toBe("a/b/c/d");
    });
  });

  describe("special cases", () => {
    it("should handle paths with dots", () => {
      const result = stripRootDirectory("owner-repo-main/.github/workflows/ci.yml");
      expect(result).toBe(".github/workflows/ci.yml");
    });

    it("should handle paths with special characters", () => {
      const result = stripRootDirectory("owner-repo-main/src/@types/index.d.ts");
      expect(result).toBe("src/@types/index.d.ts");
    });

    it("should handle paths with spaces", () => {
      const result = stripRootDirectory("owner-repo-main/my folder/file.txt");
      expect(result).toBe("my folder/file.txt");
    });
  });
});

describe("joinPathSafe", () => {
  describe("basic functionality", () => {
    it("should join multiple path segments", () => {
      const result = joinPathSafe("src", "utils", "index.ts");
      expect(result).toBe(`src${sep}utils${sep}index.ts`);
    });

    it("should join two segments", () => {
      const result = joinPathSafe("src", "index.ts");
      expect(result).toBe(`src${sep}index.ts`);
    });

    it("should handle absolute and relative paths", () => {
      const result = joinPathSafe("/usr", "local", "bin");
      expect(result).toBe(`${sep}usr${sep}local${sep}bin`);
    });
  });

  describe("edge cases", () => {
    it("should filter out empty strings", () => {
      const result = joinPathSafe("src", "", "index.ts");
      expect(result).toBe(`src${sep}index.ts`);
    });

    it("should return empty string when all segments are empty", () => {
      const result = joinPathSafe("", "", "");
      expect(result).toBe("");
    });

    it("should return empty string when no arguments", () => {
      const result = joinPathSafe();
      expect(result).toBe("");
    });

    it("should return single segment when only one valid path", () => {
      const result = joinPathSafe("", "src", "");
      expect(result).toBe("src");
    });

    it("should handle paths with trailing slashes", () => {
      const result = joinPathSafe("src/", "utils/", "index.ts");
      expect(result).toBe(`src${sep}utils${sep}index.ts`);
    });
  });

  describe("special cases", () => {
    it("should handle paths with dots (normalized by path.join)", () => {
      const result = joinPathSafe(".", "src", "index.ts");
      // path.join normalizes "." to resolve relative paths
      expect(result).toBe(`src${sep}index.ts`);
    });

    it("should handle parent directory references (normalized by path.join)", () => {
      const result = joinPathSafe("src", "..", "lib", "index.ts");
      // path.join normalizes ".." to resolve parent references
      expect(result).toBe(`lib${sep}index.ts`);
    });

    it("should handle mixed separators (normalized by path.join)", () => {
      const result = joinPathSafe("src/utils", "helpers\\index.ts");
      // Note: path.join normalizes separators to the platform default
      expect(result).toContain("src");
      expect(result).toContain("utils");
      expect(result).toContain("helpers");
      expect(result).toContain("index.ts");
    });
  });
});

describe("normalizeGitHubPath", () => {
  describe("basic functionality", () => {
    it("should keep Unix-style paths unchanged", () => {
      const result = normalizeGitHubPath("src/utils/index.ts");
      expect(result).toBe("src/utils/index.ts");
    });

    it("should normalize Windows backslashes to forward slashes", () => {
      const result = normalizeGitHubPath("src\\utils\\index.ts");
      expect(result).toBe("src/utils/index.ts");
    });

    it("should handle mixed separators", () => {
      const result = normalizeGitHubPath("src/utils\\helpers/index.ts");
      expect(result).toBe("src/utils/helpers/index.ts");
    });
  });

  describe("edge cases", () => {
    it("should remove duplicate slashes", () => {
      const result = normalizeGitHubPath("src//utils///index.ts");
      expect(result).toBe("src/utils/index.ts");
    });

    it("should remove leading slashes", () => {
      const result = normalizeGitHubPath("/src/utils/index.ts");
      expect(result).toBe("src/utils/index.ts");
    });

    it("should remove trailing slashes", () => {
      const result = normalizeGitHubPath("src/utils/");
      expect(result).toBe("src/utils");
    });

    it("should remove both leading and trailing slashes", () => {
      const result = normalizeGitHubPath("/src/utils/");
      expect(result).toBe("src/utils");
    });

    it("should return empty string for empty input", () => {
      const result = normalizeGitHubPath("");
      expect(result).toBe("");
    });

    it("should handle single segment", () => {
      const result = normalizeGitHubPath("src");
      expect(result).toBe("src");
    });

    it("should handle only slashes", () => {
      const result = normalizeGitHubPath("///");
      expect(result).toBe("");
    });
  });

  describe("special cases", () => {
    it("should handle paths with dots", () => {
      const result = normalizeGitHubPath(".github/workflows/ci.yml");
      expect(result).toBe(".github/workflows/ci.yml");
    });

    it("should handle paths with special characters", () => {
      const result = normalizeGitHubPath("src/@types/index.d.ts");
      expect(result).toBe("src/@types/index.d.ts");
    });

    it("should handle paths with spaces", () => {
      const result = normalizeGitHubPath("my folder/sub folder/file.txt");
      expect(result).toBe("my folder/sub folder/file.txt");
    });

    it("should handle complex Windows paths", () => {
      const result = normalizeGitHubPath("\\\\src\\\\utils\\\\");
      expect(result).toBe("src/utils");
    });

    it("should handle parent directory references", () => {
      const result = normalizeGitHubPath("src/../lib/index.ts");
      expect(result).toBe("src/../lib/index.ts");
    });

    it("should handle current directory references", () => {
      const result = normalizeGitHubPath("./src/./utils/index.ts");
      expect(result).toBe("./src/./utils/index.ts");
    });
  });
});
