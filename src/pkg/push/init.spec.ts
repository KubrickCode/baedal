import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileSystemError } from "../../internal/core/errors/";
import { initPushConfig, printInitSuccess } from "./init";

describe("initPushConfig", () => {
  let testBaseDir: string;

  beforeEach(async () => {
    testBaseDir = await mkdtemp(join(tmpdir(), "baedal-init-test-"));
  });

  afterEach(async () => {
    await rm(testBaseDir, { force: true, recursive: true });
  });

  describe("error cases", () => {
    beforeEach(async () => {
      await mkdir(join(testBaseDir, ".baedal/push"), { recursive: true });
      await writeFile(join(testBaseDir, ".baedal/push/test-sync.yml"), "existing content");
    });

    it("should throw a comprehensive error when config already exists", () => {
      try {
        initPushConfig("test-sync", testBaseDir);
        expect.fail("Expected initPushConfig to throw an error.");
      } catch (e) {
        if (!(e instanceof FileSystemError)) {
          expect.fail("Expected a FileSystemError to be thrown");
        }
        expect(e.message).toMatch(/Configuration file already exists/);
        expect(e.message).toMatch(/To overwrite:.*baedal push:init test-sync --force/);
        expect(e.message).toMatch(/To edit:.*open/);
      }
    });
  });

  describe("success cases", () => {
    it("should create config file when it does not exist", () => {
      const configPath = initPushConfig("new-sync", testBaseDir);

      expect(configPath).toContain(".baedal/push/new-sync.yml");
    });

    it("should overwrite existing config when force is true", async () => {
      await mkdir(join(testBaseDir, ".baedal/push"), { recursive: true });
      await writeFile(join(testBaseDir, ".baedal/push/test-sync.yml"), "old content");

      const configPath = initPushConfig("test-sync", testBaseDir, true);

      expect(configPath).toContain(".baedal/push/test-sync.yml");
    });

    it("should create directory if it does not exist", () => {
      const configPath = initPushConfig("deep-sync", testBaseDir);

      expect(configPath).toContain(".baedal/push/deep-sync.yml");
    });

    it("should generate template with sync name", async () => {
      const configPath = initPushConfig("my-sync", testBaseDir);

      const content = await readFile(configPath, "utf-8");
      expect(content).toContain("# Baedal Push Configuration: my-sync");
    });

    it("should include token placeholder in template", async () => {
      const configPath = initPushConfig("my-sync", testBaseDir);

      const content = await readFile(configPath, "utf-8");
      expect(content).toContain("token: ghp_your_token_here");
    });

    it("should include syncs section in template", async () => {
      const configPath = initPushConfig("my-sync", testBaseDir);

      const content = await readFile(configPath, "utf-8");
      expect(content).toContain("syncs:");
      expect(content).toContain("source:");
      expect(content).toContain("dest:");
      expect(content).toContain("repos:");
    });

    it("should include example repos in template", async () => {
      const configPath = initPushConfig("my-sync", testBaseDir);

      const content = await readFile(configPath, "utf-8");
      expect(content).toContain("owner/repo1");
      expect(content).toContain("owner/repo2");
    });
  });
});

describe("printInitSuccess", () => {
  it("should not throw when called with valid arguments", () => {
    expect(() => {
      printInitSuccess("/path/to/config.yml", "test-sync");
    }).not.toThrow();
  });

  it("should handle various sync names", () => {
    expect(() => {
      printInitSuccess("/path/to/config.yml", "my-special-sync");
    }).not.toThrow();
  });

  it("should handle different config paths", () => {
    expect(() => {
      printInitSuccess(".baedal/push/production.yml", "production");
    }).not.toThrow();
  });
});
