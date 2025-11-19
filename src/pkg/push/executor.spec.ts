import { ConfigError } from "../../internal/errors";
import {
  categorizeResults,
  executePush,
  prepareRepositories,
  validatePushConfig,
} from "./executor";
import type { PushConfig, PushResult } from ".";

describe("executePush", () => {
  describe("Error Handling", () => {
    it("should throw ConfigError when token is missing", async () => {
      const config = {
        syncs: [
          {
            dest: "/dest",
            repos: ["owner/repo"],
            source: "/source",
          },
        ],
        token: "",
      } as PushConfig;

      await expect(executePush(config, "test-sync")).rejects.toThrow(ConfigError);
      await expect(executePush(config, "test-sync")).rejects.toThrow("GitHub token is required");
    });

    it("should throw ConfigError with correct properties", async () => {
      const config = {
        syncs: [],
        token: "",
      } as PushConfig;

      try {
        await executePush(config, "test-sync");
        fail("Should have thrown ConfigError");
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigError);
        if (error instanceof ConfigError) {
          expect(error.code).toBe("CONFIG_ERROR");
          expect(error.field).toBe("token");
          expect(error.value).toBeUndefined();
          expect(error.message).toContain("GitHub token is required");
        }
      }
    });

    it("should throw ConfigError when token is whitespace only", async () => {
      const config = {
        syncs: [],
        token: "   ",
      } as PushConfig;

      await expect(executePush(config, "test-sync")).rejects.toThrow(ConfigError);
    });
  });

  describe("Error Classes", () => {
    it("ConfigError should extend Error", () => {
      const error = new ConfigError("Test message", "testField", "testValue");
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test message");
    });

    it("ConfigError should have correct code property", () => {
      const error = new ConfigError("Test", "field", "value");
      expect(error.code).toBe("CONFIG_ERROR");
    });

    it("ConfigError should capture field and value", () => {
      const error = new ConfigError("Test", "myField", 123);
      expect(error.field).toBe("myField");
      expect(error.value).toBe(123);
    });
  });
});

describe("validatePushConfig", () => {
  it("should not throw when token is valid", () => {
    const config = {
      syncs: [],
      token: "valid-token",
    } as PushConfig;

    expect(() => validatePushConfig(config)).not.toThrow();
  });

  it("should throw ConfigError when token is empty string", () => {
    const config = {
      syncs: [],
      token: "",
    } as PushConfig;

    expect(() => validatePushConfig(config)).toThrow(ConfigError);
    expect(() => validatePushConfig(config)).toThrow("GitHub token is required");
  });

  it("should throw ConfigError when token is whitespace only", () => {
    const config = {
      syncs: [],
      token: "   ",
    } as PushConfig;

    expect(() => validatePushConfig(config)).toThrow(ConfigError);
  });

  it("should throw ConfigError with correct properties", () => {
    const config = {
      syncs: [],
      token: "",
    } as PushConfig;

    try {
      validatePushConfig(config);
      fail("Should have thrown ConfigError");
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      if (error instanceof ConfigError) {
        expect(error.code).toBe("CONFIG_ERROR");
        expect(error.field).toBe("token");
        expect(error.value).toBeUndefined();
      }
    }
  });
});

describe("prepareRepositories", () => {
  it("should prepare repositories from single sync config", () => {
    const config = {
      syncs: [
        {
          dest: "/dest",
          repos: ["owner/repo1", "owner/repo2"],
          source: "/source",
        },
      ],
      token: "test-token",
    } as PushConfig;

    const branchName = "sync/test-123";
    const syncName = "test-sync";

    const result = prepareRepositories(config, branchName, syncName);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      branchName: "sync/test-123",
      destPath: "/dest",
      repoName: "owner/repo1",
      sourcePath: "/source",
      syncName: "test-sync",
      token: "test-token",
    });
    expect(result[1]).toEqual({
      branchName: "sync/test-123",
      destPath: "/dest",
      repoName: "owner/repo2",
      sourcePath: "/source",
      syncName: "test-sync",
      token: "test-token",
    });
  });

  it("should prepare repositories from multiple sync configs", () => {
    const config = {
      syncs: [
        {
          dest: "/dest1",
          repos: ["owner/repo1"],
          source: "/source1",
        },
        {
          dest: "/dest2",
          repos: ["owner/repo2", "owner/repo3"],
          source: "/source2",
        },
      ],
      token: "test-token",
    } as PushConfig;

    const branchName = "sync/test-123";
    const syncName = "test-sync";

    const result = prepareRepositories(config, branchName, syncName);

    expect(result).toHaveLength(3);
    expect(result[0]?.repoName).toBe("owner/repo1");
    expect(result[0]?.sourcePath).toBe("/source1");
    expect(result[1]?.repoName).toBe("owner/repo2");
    expect(result[1]?.sourcePath).toBe("/source2");
    expect(result[2]?.repoName).toBe("owner/repo3");
    expect(result[2]?.sourcePath).toBe("/source2");
  });

  it("should return empty array when no syncs", () => {
    const config = {
      syncs: [],
      token: "test-token",
    } as PushConfig;

    const result = prepareRepositories(config, "branch", "sync");

    expect(result).toEqual([]);
  });

  it("should handle sync with no repos", () => {
    const config = {
      syncs: [
        {
          dest: "/dest",
          repos: [],
          source: "/source",
        },
      ],
      token: "test-token",
    } as PushConfig;

    const result = prepareRepositories(config, "branch", "sync");

    expect(result).toEqual([]);
  });
});

describe("categorizeResults", () => {
  it("should categorize all successful results", () => {
    const results: PushResult[] = [
      { prUrl: "url1", repo: "owner/repo1", success: true },
      { prUrl: "url2", repo: "owner/repo2", success: true },
    ];

    const categorized = categorizeResults(results);

    expect(categorized.successful).toHaveLength(2);
    expect(categorized.failed).toHaveLength(0);
    expect(categorized.successful[0]?.repo).toBe("owner/repo1");
    expect(categorized.successful[1]?.repo).toBe("owner/repo2");
  });

  it("should categorize all failed results", () => {
    const results: PushResult[] = [
      { error: "error1", repo: "owner/repo1", success: false },
      { error: "error2", repo: "owner/repo2", success: false },
    ];

    const categorized = categorizeResults(results);

    expect(categorized.successful).toHaveLength(0);
    expect(categorized.failed).toHaveLength(2);
    expect(categorized.failed[0]?.repo).toBe("owner/repo1");
    expect(categorized.failed[1]?.repo).toBe("owner/repo2");
  });

  it("should categorize mixed results", () => {
    const results: PushResult[] = [
      { prUrl: "url1", repo: "owner/repo1", success: true },
      { error: "error1", repo: "owner/repo2", success: false },
      { prUrl: "url2", repo: "owner/repo3", success: true },
      { error: "error2", repo: "owner/repo4", success: false },
    ];

    const categorized = categorizeResults(results);

    expect(categorized.successful).toHaveLength(2);
    expect(categorized.failed).toHaveLength(2);
    expect(categorized.successful.map((r) => r.repo)).toEqual(["owner/repo1", "owner/repo3"]);
    expect(categorized.failed.map((r) => r.repo)).toEqual(["owner/repo2", "owner/repo4"]);
  });

  it("should return empty arrays for empty input", () => {
    const results: PushResult[] = [];

    const categorized = categorizeResults(results);

    expect(categorized.successful).toEqual([]);
    expect(categorized.failed).toEqual([]);
  });
});
