import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileSystemError } from "../../internal/errors";
import { collectFiles, getRelativePath, normalizePath } from "./files";

describe("Push Files - Integration Test", () => {
  const MAX_FILE_SIZE_MB = 11;
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "baedal-files-test-"));
  });

  afterEach(async () => {
    await rm(testDir, { force: true, recursive: true });
  });

  describe("normalizePath", () => {
    it("should normalize Windows path to Unix", () => {
      expect(normalizePath("src\\components\\Button.tsx")).toBe("src/components/Button.tsx");
    });

    it("should remove leading ./", () => {
      expect(normalizePath("./src/utils.ts")).toBe("src/utils.ts");
    });

    it("should handle already normalized paths", () => {
      expect(normalizePath("src/index.ts")).toBe("src/index.ts");
    });
  });

  describe("getRelativePath", () => {
    it("should get relative path between directories", () => {
      const result = getRelativePath("/project/src", "/project/src/components/Button.tsx");
      expect(result).toBe("components/Button.tsx");
    });
  });

  describe("collectFiles", () => {
    it("should collect single file", async () => {
      const testFile = join(testDir, "test.ts");
      await writeFile(testFile, "export const test = 1;");

      const files = await collectFiles("test.ts", testDir);

      expect(files).toHaveLength(1);
      expect(files[0]?.path).toBe("test.ts");
      expect(files[0]?.content).toBe("export const test = 1;");
      expect(files[0]?.size).toBeGreaterThan(0);
    });

    it("should collect all files from directory", async () => {
      await mkdir(join(testDir, "src"), { recursive: true });
      await writeFile(join(testDir, "src/index.ts"), "console.log('index')");
      await writeFile(join(testDir, "src/utils.ts"), "export const util = 1");

      const files = await collectFiles("src", testDir);

      expect(files).toHaveLength(2);
      expect(files.map((f) => f.path).sort()).toEqual(["src/index.ts", "src/utils.ts"]);
    });

    it("should collect files from nested directories", async () => {
      await mkdir(join(testDir, "src/components"), { recursive: true });
      await mkdir(join(testDir, "src/utils"), { recursive: true });
      await writeFile(join(testDir, "src/components/Button.tsx"), "export const Button = 1");
      await writeFile(join(testDir, "src/utils/helper.ts"), "export const help = 1");
      await writeFile(join(testDir, "src/index.ts"), "export *");

      const files = await collectFiles("src", testDir);

      expect(files.length).toBe(3);
      const paths = files.map((f) => f.path).sort();
      expect(paths[0]).toBe("src/components/Button.tsx");
      expect(paths[1]).toBe("src/index.ts");
      expect(paths[2]).toBe("src/utils/helper.ts");
    });

    it("should handle hidden files", async () => {
      await mkdir(join(testDir, "src"), { recursive: true });
      await writeFile(join(testDir, "src/.gitignore"), "node_modules");
      await writeFile(join(testDir, "src/index.ts"), "code");

      const files = await collectFiles("src", testDir);

      expect(files.some((f) => f.path === "src/.gitignore")).toBe(true);
    });

    it("should throw FileSystemError for file exceeding max size", async () => {
      const largeContent = "x".repeat(MAX_FILE_SIZE_MB * 1024 * 1024);
      await writeFile(join(testDir, "large.ts"), largeContent);

      try {
        await collectFiles("large.ts", testDir);
        fail("Should have thrown FileSystemError");
      } catch (error) {
        expect(error).toBeInstanceOf(FileSystemError);
        expect(error).toHaveProperty("message", expect.stringContaining("exceeds maximum"));
      }
    });

    it("should throw FileSystemError when no files found in directory", async () => {
      await mkdir(join(testDir, "empty"), { recursive: true });

      try {
        await collectFiles("empty", testDir);
        fail("Should have thrown FileSystemError");
      } catch (error) {
        expect(error).toBeInstanceOf(FileSystemError);
        expect(error).toHaveProperty("message", expect.stringContaining("No files found"));
      }
    });

    it("should throw error for non-existent path", async () => {
      await expect(collectFiles("nonexistent.ts", testDir)).rejects.toThrow();
    });

    it("should include file content and size", async () => {
      const content = "export const value = 42;";
      await writeFile(join(testDir, "code.ts"), content);

      const files = await collectFiles("code.ts", testDir);

      expect(files[0]?.content).toBe(content);
      expect(files[0]?.size).toBe(Buffer.byteLength(content));
    });

    it("should skip files exceeding max size and collect valid files", async () => {
      await mkdir(join(testDir, "src"), { recursive: true });

      const largeContent = "x".repeat(MAX_FILE_SIZE_MB * 1024 * 1024);
      await writeFile(join(testDir, "src/large.ts"), largeContent);
      await writeFile(join(testDir, "src/small.ts"), "small content");

      const files = await collectFiles("src", testDir);

      // Should only collect the small file, skipping the large one
      expect(files).toHaveLength(1);
      expect(files[0]?.path).toBe("src/small.ts");
      expect(files[0]?.content).toBe("small content");
    });
  });
});
