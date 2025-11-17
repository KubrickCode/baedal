import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { create } from "tar";
import { ExtractionError, FileSystemError } from "../errors/index.js";
import { extractTarball, getFileListFromTarball } from "./extract.js";

/**
 * Integration test helper for creating real tarballs.
 *
 * We use real tarball creation instead of mocks because:
 * 1. The tar library's extraction behavior is complex and difficult to mock accurately
 * 2. We need to verify actual file system operations work correctly
 * 3. Edge cases (special characters, hidden files, nested paths) require real tar operations
 * 4. This ensures compatibility with GitHub's tarball format
 */
const createTestTarball = async (
  files: Record<string, string>,
  prefix = "test-repo-main"
): Promise<string> => {
  const tempDir = join(
    tmpdir(),
    `baedal-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const sourceDir = join(tempDir, "source");
  const prefixDir = join(sourceDir, prefix);
  const tarballPath = join(tempDir, "test.tar.gz");

  await mkdir(prefixDir, { recursive: true });

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(prefixDir, filePath);
    const dir = dirname(fullPath);
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, content, "utf-8");
  }

  await create({ cwd: sourceDir, file: tarballPath, gzip: true }, [prefix]);

  return tarballPath;
};

const cleanupTestFiles = async (...paths: string[]) => {
  for (const path of paths) {
    try {
      await rm(path, { force: true, recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  }
};

describe("extractTarball", () => {
  describe("without subdirectory", () => {
    it("should extract all files", async () => {
      const files = {
        "package.json": '{"name":"test"}',
        "README.md": "# Test",
        "src/index.ts": "export const hello = 'world';",
      };

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );

      try {
        const result = await extractTarball(tarballPath, destination);

        expect(result).toHaveLength(3);
        expect(result).toContain("src/index.ts");
        expect(result).toContain("README.md");
        expect(result).toContain("package.json");
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });

    it("should apply exclude patterns", async () => {
      const files = {
        "node_modules/lib.js": "lib",
        "README.md": "# Test",
        "src/index.test.ts": "test",
        "src/index.ts": "export const hello = 'world';",
      };

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );
      const exclude = ["**/*.test.ts", "node_modules/**"];

      try {
        const result = await extractTarball(tarballPath, destination, undefined, exclude);

        expect(result).toHaveLength(2);
        expect(result).toContain("src/index.ts");
        expect(result).toContain("README.md");
        expect(result).not.toContain("src/index.test.ts");
        expect(result).not.toContain("node_modules/lib.js");

        await expect(access(join(destination, "src/index.test.ts"))).rejects.toThrow();
        await expect(access(join(destination, "node_modules/lib.js"))).rejects.toThrow();
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });

    it("should include hidden files", async () => {
      const files = {
        ".github/workflows/ci.yml": "name: CI",
        ".gitignore": "node_modules/",
        "src/index.ts": "export const hello = 'world';",
      };

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );

      try {
        const result = await extractTarball(tarballPath, destination);

        expect(result).toContain(".gitignore");
        expect(result).toContain(".github/workflows/ci.yml");
        expect(result).toContain("src/index.ts");
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });
  });

  describe("with subdirectory", () => {
    it("should extract only subdirectory", async () => {
      const files = {
        "lib/index.js": "module.exports = {}",
        "README.md": "# Test",
        "src/index.ts": "export const hello = 'world';",
        "src/utils/helper.ts": "export const helper = () => {}",
      };

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );
      const subdir = "src";

      try {
        const result = await extractTarball(tarballPath, destination, subdir);

        expect(result).toHaveLength(2);
        expect(result).toContain("index.ts");
        expect(result).toContain("utils/helper.ts");
        expect(result).not.toContain("README.md");
        expect(result).not.toContain("lib/index.js");
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });

    it("should extract single file", async () => {
      const files = {
        "README.md": "# Test Project",
        "src/index.ts": "export const hello = 'world';",
      };

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );
      const subdir = "README.md";

      try {
        const result = await extractTarball(tarballPath, destination, subdir);

        expect(result).toHaveLength(1);
        expect(result).toContain("README.md");
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });

    it("should apply exclude patterns", async () => {
      const files = {
        "README.md": "# Test",
        "src/index.spec.ts": "test",
        "src/index.ts": "export const hello = 'world';",
        "src/utils/helper.ts": "export const helper = () => {}",
      };

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );
      const subdir = "src";
      const exclude = ["*.spec.ts"];

      try {
        const result = await extractTarball(tarballPath, destination, subdir, exclude);

        expect(result).toHaveLength(2);
        expect(result).toContain("index.ts");
        expect(result).toContain("utils/helper.ts");
        expect(result).not.toContain("index.spec.ts");

        await expect(access(join(destination, "index.spec.ts"))).rejects.toThrow();
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });

    it("should extract nested subdirectory", async () => {
      const files = {
        "src/index.ts": "export const hello = 'world';",
        "src/utils/helpers/number.ts": "export const add = (a: number, b: number) => a + b",
        "src/utils/helpers/string.ts": "export const capitalize = (s: string) => s",
      };

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );
      const subdir = "src/utils/helpers";

      try {
        const result = await extractTarball(tarballPath, destination, subdir);

        expect(result).toHaveLength(2);
        expect(result).toContain("string.ts");
        expect(result).toContain("number.ts");
        expect(result).not.toContain("index.ts");
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });
  });

  describe("error handling", () => {
    it("should throw ExtractionError for nonexistent tarball", async () => {
      const tarballPath = "/nonexistent/path/to/tarball.tar.gz";
      const destination = join(tmpdir(), `baedal-dest-${Date.now()}`);

      await expect(extractTarball(tarballPath, destination)).rejects.toThrow(ExtractionError);
    });

    it("should throw FileSystemError for nonexistent subdirectory", async () => {
      const files = {
        "src/index.ts": "export const hello = 'world';",
      };

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );
      const subdir = "nonexistent-dir";

      try {
        await expect(extractTarball(tarballPath, destination, subdir)).rejects.toThrow(
          FileSystemError
        );
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty tarball", async () => {
      const files = {};

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );

      try {
        const result = await extractTarball(tarballPath, destination);

        expect(result).toHaveLength(0);
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });

    it("should handle special characters in filenames", async () => {
      const files = {
        "my folder/file.txt": "content",
        "src/@types/index.d.ts": "export type MyType = string;",
      };

      const tarballPath = await createTestTarball(files);
      const destination = join(
        tmpdir(),
        `baedal-dest-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );

      try {
        const result = await extractTarball(tarballPath, destination);

        expect(result).toContain("src/@types/index.d.ts");
        expect(result).toContain("my folder/file.txt");
      } finally {
        await cleanupTestFiles(dirname(tarballPath), destination);
      }
    });
  });
});

describe("getFileListFromTarball", () => {
  describe("basic functionality", () => {
    it("should list all files", async () => {
      const files = {
        "package.json": '{"name":"test"}',
        "README.md": "# Test",
        "src/index.ts": "export const hello = 'world';",
      };

      const tarballPath = await createTestTarball(files);

      try {
        const result = await getFileListFromTarball(tarballPath);

        expect(result).toHaveLength(3);
        expect(result).toContain("src/index.ts");
        expect(result).toContain("README.md");
        expect(result).toContain("package.json");
      } finally {
        await cleanupTestFiles(dirname(tarballPath));
      }
    });

    it("should filter by subdirectory", async () => {
      const files = {
        "lib/index.js": "module.exports = {}",
        "README.md": "# Test",
        "src/index.ts": "export const hello = 'world';",
        "src/utils/helper.ts": "export const helper = () => {}",
      };

      const tarballPath = await createTestTarball(files);
      const subdir = "src";

      try {
        const result = await getFileListFromTarball(tarballPath, subdir);

        expect(result).toHaveLength(2);
        expect(result).toContain("index.ts");
        expect(result).toContain("utils/helper.ts");
        expect(result).not.toContain("README.md");
      } finally {
        await cleanupTestFiles(dirname(tarballPath));
      }
    });

    it("should apply exclude patterns", async () => {
      const files = {
        "node_modules/lib.js": "lib",
        "README.md": "# Test",
        "src/index.test.ts": "test",
        "src/index.ts": "export const hello = 'world';",
      };

      const tarballPath = await createTestTarball(files);
      const exclude = ["**/*.test.ts", "node_modules/**"];

      try {
        const result = await getFileListFromTarball(tarballPath, undefined, exclude);

        expect(result).toHaveLength(2);
        expect(result).toContain("src/index.ts");
        expect(result).toContain("README.md");
        expect(result).not.toContain("src/index.test.ts");
        expect(result).not.toContain("node_modules/lib.js");
      } finally {
        await cleanupTestFiles(dirname(tarballPath));
      }
    });

    it("should combine subdirectory and exclude patterns", async () => {
      const files = {
        "README.md": "# Test",
        "src/index.spec.ts": "test",
        "src/index.ts": "export const hello = 'world';",
        "src/utils/helper.ts": "export const helper = () => {}",
      };

      const tarballPath = await createTestTarball(files);
      const subdir = "src";
      const exclude = ["*.spec.ts"];

      try {
        const result = await getFileListFromTarball(tarballPath, subdir, exclude);

        expect(result).toHaveLength(2);
        expect(result).toContain("index.ts");
        expect(result).toContain("utils/helper.ts");
        expect(result).not.toContain("index.spec.ts");
        expect(result).not.toContain("README.md");
      } finally {
        await cleanupTestFiles(dirname(tarballPath));
      }
    });

    it("should include hidden files", async () => {
      const files = {
        ".github/workflows/ci.yml": "name: CI",
        ".gitignore": "node_modules/",
        "src/index.ts": "export const hello = 'world';",
      };

      const tarballPath = await createTestTarball(files);

      try {
        const result = await getFileListFromTarball(tarballPath);

        expect(result).toContain(".gitignore");
        expect(result).toContain(".github/workflows/ci.yml");
        expect(result).toContain("src/index.ts");
      } finally {
        await cleanupTestFiles(dirname(tarballPath));
      }
    });
  });

  describe("error handling", () => {
    it("should throw ExtractionError for nonexistent tarball", async () => {
      const tarballPath = "/nonexistent/path/to/tarball.tar.gz";

      await expect(getFileListFromTarball(tarballPath)).rejects.toThrow(ExtractionError);
    });

    it("should include path and cause in error", async () => {
      const tarballPath = "/nonexistent/path/to/tarball.tar.gz";

      try {
        await getFileListFromTarball(tarballPath);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ExtractionError);
        expect((error as ExtractionError).path).toBe(tarballPath);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty tarball", async () => {
      const files = {};

      const tarballPath = await createTestTarball(files);

      try {
        const result = await getFileListFromTarball(tarballPath);

        expect(result).toHaveLength(0);
      } finally {
        await cleanupTestFiles(dirname(tarballPath));
      }
    });

    it("should handle deeply nested files", async () => {
      const files = {
        "src/utils/helpers/string/capitalize.ts": "export const capitalize = (s: string) => s",
      };

      const tarballPath = await createTestTarball(files);

      try {
        const result = await getFileListFromTarball(tarballPath);

        expect(result).toContain("src/utils/helpers/string/capitalize.ts");
      } finally {
        await cleanupTestFiles(dirname(tarballPath));
      }
    });

    it("should handle special characters in filenames", async () => {
      const files = {
        "my folder/file.txt": "content",
        "src/@types/index.d.ts": "export type MyType = string;",
      };

      const tarballPath = await createTestTarball(files);

      try {
        const result = await getFileListFromTarball(tarballPath);

        expect(result).toContain("src/@types/index.d.ts");
        expect(result).toContain("my folder/file.txt");
      } finally {
        await cleanupTestFiles(dirname(tarballPath));
      }
    });
  });
});
