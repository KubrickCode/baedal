import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ZodError } from "zod";
import { loadPushConfig, resolveConfigPath } from "./config";

describe("Push Config - Integration Test", () => {
  let testBaseDir: string;

  beforeEach(async () => {
    testBaseDir = await mkdtemp(join(tmpdir(), "baedal-config-test-"));
    await mkdir(join(testBaseDir, ".baedal/push"), { recursive: true });
  });

  afterEach(async () => {
    await rm(testBaseDir, { force: true, recursive: true });
  });

  describe("resolveConfigPath", () => {
    it("should resolve config path correctly", () => {
      const path = resolveConfigPath("my-sync", testBaseDir);
      expect(path).toBe(join(testBaseDir, ".baedal/push/my-sync.yml"));
    });

    it("should use current directory when baseDir not provided", () => {
      const path = resolveConfigPath("test-sync");
      expect(path).toContain(".baedal/push/test-sync.yml");
    });
  });

  describe("loadPushConfig", () => {
    it("should load valid config file", async () => {
      const configYaml = `
token: "test-token"
syncs:
  - dest: /dest
    repos:
      - owner/repo1
      - owner/repo2
    source: ./src
`;
      await writeFile(join(testBaseDir, ".baedal/push/test-sync.yml"), configYaml);

      const config = loadPushConfig("test-sync", testBaseDir);

      expect(config.syncs).toHaveLength(1);
      expect(config.syncs[0]?.repos).toHaveLength(2);
      expect(config.token).toBe("test-token");
    });

    it("should load config with multiple syncs", async () => {
      const configYaml = `
token: "github-token"
syncs:
  - dest: /src
    repos:
      - org/repo1
    source: ./src
  - dest: /docs
    repos:
      - org/repo2
      - org/repo3
    source: ./docs
`;
      await writeFile(join(testBaseDir, ".baedal/push/multi.yml"), configYaml);

      const config = loadPushConfig("multi", testBaseDir);

      expect(config.syncs).toHaveLength(2);
      expect(config.syncs[0]?.source).toBe("./src");
      expect(config.syncs[1]?.repos).toHaveLength(2);
    });

    it("should throw error when config file does not exist", () => {
      expect(() => loadPushConfig("nonexistent", testBaseDir)).toThrow(
        "Configuration file not found"
      );
    });

    it("should include init command hint in error message", () => {
      expect(() => loadPushConfig("nonexistent", testBaseDir)).toThrow(
        /Try: baedal push:init nonexistent/
      );
    });

    it("should throw error for invalid YAML", async () => {
      const invalidYaml = `
token: test
syncs:
  - invalid structure
`;
      await writeFile(join(testBaseDir, ".baedal/push/invalid.yml"), invalidYaml);

      expect(() => loadPushConfig("invalid", testBaseDir)).toThrow(ZodError);
    });

    it("should throw error when required fields are missing", async () => {
      const incompleteYaml = `
token: "test-token"
`;
      await writeFile(join(testBaseDir, ".baedal/push/incomplete.yml"), incompleteYaml);

      expect(() => loadPushConfig("incomplete", testBaseDir)).toThrow(ZodError);
    });
  });
});
