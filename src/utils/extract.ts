import { copyFile, cp, mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { globby } from "globby";
import micromatch from "micromatch";
import { extract, list } from "tar";

/**
 * Normalize tar entry path by stripping repository root and applying subdir/exclude logic
 * @returns normalized path if file should be included, null if excluded (optional type pattern)
 */
const getNormalizedTarPath = (
  entryPath: string,
  subdir?: string,
  // Use null for optional type pattern: function = has exclusion logic, null = no exclusion
  shouldExclude?: ((path: string) => boolean) | null
): string | null => {
  // Strip the first path segment (repository root)
  const strippedPath = entryPath.split("/").slice(1).join("/");

  let targetPath: string;
  if (subdir) {
    if (!strippedPath.startsWith(subdir)) {
      return null;
    }
    // Remove the subdir prefix
    targetPath = strippedPath.slice(subdir.length + 1);
  } else {
    targetPath = strippedPath;
  }

  if (!targetPath || (shouldExclude && shouldExclude(targetPath))) {
    return null;
  }

  return targetPath;
};

export const extractTarball = async (
  tarballPath: string,
  destination: string,
  subdir?: string,
  exclude?: string[]
): Promise<string[]> => {
  const shouldExclude =
    exclude && exclude.length > 0 ? (path: string) => micromatch.isMatch(path, exclude) : null;

  const extractOptions = {
    cwd: destination,
    file: tarballPath,
    strip: 1,
    ...(shouldExclude
      ? {
          filter: (path: string) => {
            const normalizedPath = getNormalizedTarPath(path, undefined, shouldExclude);
            return normalizedPath !== null;
          },
        }
      : {}),
  };

  if (!subdir) {
    await extract(extractOptions);
  } else {
    const tempExtract = await mkdtemp(join(tmpdir(), "baedal-extract-"));

    try {
      await extract({
        ...extractOptions,
        cwd: tempExtract,
      });

      const sourcePath = join(tempExtract, subdir);
      const sourceStats = await stat(sourcePath);

      if (sourceStats.isFile()) {
        await mkdir(destination, { recursive: true });
        await copyFile(sourcePath, join(destination, basename(subdir)));
      } else {
        await cp(sourcePath, destination, { recursive: true });
      }
    } finally {
      await rm(tempExtract, { force: true, recursive: true });
    }
  }

  const files = await globby("**/*", {
    cwd: destination,
    dot: true, // Include hidden files like .gitignore
    onlyFiles: true,
  });
  return files;
};

export const getFileListFromTarball = async (
  tarballPath: string,
  subdir?: string,
  exclude?: string[]
): Promise<string[]> => {
  const files: string[] = [];

  const shouldExclude =
    exclude && exclude.length > 0 ? (path: string) => micromatch.isMatch(path, exclude) : null;

  await list({
    file: tarballPath,
    onentry: (entry) => {
      if (entry.type !== "File") {
        return;
      }

      const normalizedPath = getNormalizedTarPath(entry.path, subdir, shouldExclude);

      if (normalizedPath) {
        files.push(normalizedPath);
      }
    },
  });

  return files;
};
