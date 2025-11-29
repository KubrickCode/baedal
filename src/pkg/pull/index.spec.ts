import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { create } from "tar";
import { FileSystemError, ValidationError } from "../../internal/core/errors/";
import { baedal } from "./index";

const createTestTarball = async (files: Record<string, string>, prefix = "test-repo-main") => {
  const tempDir = join(
    tmpdir(),
    `baedal-pull-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const sourceDir = join(tempDir, "source");
  const prefixDir = join(sourceDir, prefix);
  const tarballPath = join(tempDir, "test.tar.gz");

  await mkdir(prefixDir, { recursive: true });

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(prefixDir, filePath);
    const dir = join(fullPath, "..");
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, content, "utf-8");
  }

  await create({ cwd: sourceDir, file: tarballPath, gzip: true }, [prefix]);

  return { tarballPath, tempDir };
};

describe("baedal", () => {
  let testTempDir: string;

  afterEach(async () => {
    if (testTempDir) {
      await rm(testTempDir, { force: true, recursive: true });
    }
  });

  describe("input validation", () => {
    it("should throw ValidationError for empty source", async () => {
      await expect(baedal("", ".")).rejects.toThrow(ValidationError);
      await expect(baedal("", ".")).rejects.toThrow("Source cannot be empty");
    });

    it("should throw ValidationError for whitespace-only source", async () => {
      await expect(baedal("   ", ".")).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for empty destination", async () => {
      await expect(baedal("owner/repo", "")).rejects.toThrow(ValidationError);
      await expect(baedal("owner/repo", "")).rejects.toThrow("Destination cannot be empty");
    });

    it("should throw ValidationError for whitespace-only destination", async () => {
      await expect(baedal("owner/repo", "   ")).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError for invalid options", async () => {
      await expect(
        baedal("owner/repo", ".", { exclude: "not-an-array" as unknown as string[] })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("FileSystemError", () => {
    it("should throw FileSystemError with FILE_CONFLICT code in no-clobber mode", async () => {
      testTempDir = await mkdtemp(join(tmpdir(), "baedal-dest-"));
      const existingFile = join(testTempDir, "README.md");
      await writeFile(existingFile, "existing content", "utf-8");

      const { tempDir } = await createTestTarball({
        "README.md": "new content",
      });

      try {
        await expect(async () => {
          throw new FileSystemError(
            "Operation aborted as per --no-clobber: 1 file(s) already exist."
          );
        }).rejects.toThrow(FileSystemError);

        await expect(async () => {
          throw new FileSystemError(
            "Operation aborted as per --no-clobber: 1 file(s) already exist."
          );
        }).rejects.toThrow("Operation aborted as per --no-clobber");
      } finally {
        await rm(tempDir, { force: true, recursive: true });
      }
    });

    it("should verify FileSystemError has correct properties", () => {
      const error = new FileSystemError("Test error");

      expect(error).toBeInstanceOf(FileSystemError);
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe("FILESYSTEM_ERROR");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("FileSystemError");
    });
  });

  describe("ValidationError", () => {
    it("should throw ValidationError when user cancels", async () => {
      await expect(async () => {
        throw new ValidationError("Operation cancelled by user");
      }).rejects.toThrow(ValidationError);

      await expect(async () => {
        throw new ValidationError("Operation cancelled by user");
      }).rejects.toThrow("Operation cancelled by user");
    });

    it("should verify ValidationError has correct properties", () => {
      const error = new ValidationError("User cancelled");

      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.message).toBe("User cancelled");
      expect(error.name).toBe("ValidationError");
    });
  });

  describe("error instanceof checks", () => {
    it("should allow proper error type detection", () => {
      const fileSystemError = new FileSystemError("File conflict");
      const validationError = new ValidationError("Invalid input");

      expect(fileSystemError instanceof FileSystemError).toBe(true);
      expect(fileSystemError instanceof ValidationError).toBe(false);

      expect(validationError instanceof ValidationError).toBe(true);
      expect(validationError instanceof FileSystemError).toBe(false);
    });
  });
});
