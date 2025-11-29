import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileSystemError } from "../core/index";
import { compareFileHash } from "./file-compare";

describe("compareFileHash", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "baedal-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { force: true, recursive: true });
  });

  describe("basic functionality", () => {
    it("should return true for identical files", async () => {
      const file1 = join(tempDir, "file1.txt");
      const file2 = join(tempDir, "file2.txt");

      await writeFile(file1, "Hello World");
      await writeFile(file2, "Hello World");

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(true);
    });

    it("should return false for different files", async () => {
      const file1 = join(tempDir, "file1.txt");
      const file2 = join(tempDir, "file2.txt");

      await writeFile(file1, "Hello World");
      await writeFile(file2, "Goodbye World");

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(false);
    });

    it("should return true for empty files", async () => {
      const file1 = join(tempDir, "empty1.txt");
      const file2 = join(tempDir, "empty2.txt");

      await writeFile(file1, "");
      await writeFile(file2, "");

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should return false when files differ by a single character", async () => {
      const file1 = join(tempDir, "file1.txt");
      const file2 = join(tempDir, "file2.txt");

      await writeFile(file1, "Hello World");
      await writeFile(file2, "Hello world");

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(false);
    });

    it("should return false when files differ by whitespace", async () => {
      const file1 = join(tempDir, "file1.txt");
      const file2 = join(tempDir, "file2.txt");

      await writeFile(file1, "Hello World");
      await writeFile(file2, "Hello World ");

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(false);
    });

    it("should return false when files differ by newlines", async () => {
      const file1 = join(tempDir, "file1.txt");
      const file2 = join(tempDir, "file2.txt");

      await writeFile(file1, "Hello\nWorld");
      await writeFile(file2, "Hello\r\nWorld");

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(false);
    });
  });

  describe("binary files", () => {
    it("should correctly compare identical binary files", async () => {
      const file1 = join(tempDir, "binary1.bin");
      const file2 = join(tempDir, "binary2.bin");

      const buffer = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd]);
      await writeFile(file1, buffer);
      await writeFile(file2, buffer);

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(true);
    });

    it("should correctly detect different binary files", async () => {
      const file1 = join(tempDir, "binary1.bin");
      const file2 = join(tempDir, "binary2.bin");

      await writeFile(file1, Buffer.from([0x00, 0x01, 0x02]));
      await writeFile(file2, Buffer.from([0x00, 0x01, 0x03]));

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(false);
    });
  });

  describe("large files", () => {
    it("should handle large files efficiently", async () => {
      const file1 = join(tempDir, "large1.txt");
      const file2 = join(tempDir, "large2.txt");

      const largeContent = "x".repeat(1024 * 1024);
      await writeFile(file1, largeContent);
      await writeFile(file2, largeContent);

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(true);
    });

    it("should detect differences in large files", async () => {
      const file1 = join(tempDir, "large1.txt");
      const file2 = join(tempDir, "large2.txt");

      const largeContent1 = "x".repeat(1024 * 1024);
      const largeContent2 = "x".repeat(1024 * 1024 - 1) + "y";

      await writeFile(file1, largeContent1);
      await writeFile(file2, largeContent2);

      const result = await compareFileHash(file1, file2);
      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should throw FileSystemError when first file does not exist", async () => {
      const nonExistentFile = join(tempDir, "nonexistent1.txt");
      const existingFile = join(tempDir, "existing.txt");

      await writeFile(existingFile, "content");

      await expect(compareFileHash(nonExistentFile, existingFile)).rejects.toThrow(FileSystemError);
    });

    it("should throw FileSystemError when second file does not exist", async () => {
      const existingFile = join(tempDir, "existing.txt");
      const nonExistentFile = join(tempDir, "nonexistent2.txt");

      await writeFile(existingFile, "content");

      await expect(compareFileHash(existingFile, nonExistentFile)).rejects.toThrow(FileSystemError);
    });

    it("should throw FileSystemError with file path context", async () => {
      const nonExistentFile = join(tempDir, "nonexistent.txt");
      const existingFile = join(tempDir, "existing.txt");

      await writeFile(existingFile, "content");

      await expect(compareFileHash(nonExistentFile, existingFile)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("Failed to calculate hash"),
        })
      );
    });
  });
});
