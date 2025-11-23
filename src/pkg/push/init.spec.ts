import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileSystemError } from "../../internal/core/errors/";
import { initPushConfig } from "./init";

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
        fail("Expected initPushConfig to throw an error.");
      } catch (e) {
        if (!(e instanceof FileSystemError)) {
          fail("Expected a FileSystemError to be thrown");
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
  });
});
