import { copyFile, cp, mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename } from "node:path";
import { globby } from "globby";
import micromatch from "micromatch";
import { extract, list } from "tar";
import { ExtractionError, FileSystemError } from "../errors";
import { joinPathSafe, stripRootDirectory } from "./path-helpers";

const getNormalizedTarPath = (
  entryPath: string,
  subdir?: string,
  shouldExclude?: ((path: string) => boolean) | null
): string | null => {
  const strippedPath = stripRootDirectory(entryPath);

  let targetPath: string;
  if (subdir) {
    if (!strippedPath.startsWith(subdir)) {
      return null;
    }
    targetPath = strippedPath.slice(subdir.length + 1);
  } else {
    targetPath = strippedPath;
  }

  if (!targetPath || (shouldExclude && shouldExclude(targetPath))) {
    return null;
  }

  return targetPath;
};

const copySubdirectory = async (
  tempDir: string,
  destination: string,
  subdir: string
): Promise<void> => {
  const sourcePath = joinPathSafe(tempDir, subdir);

  try {
    const sourceStats = await stat(sourcePath);

    if (sourceStats.isFile()) {
      await mkdir(destination, { recursive: true });
      await copyFile(sourcePath, joinPathSafe(destination, basename(subdir)));
    } else {
      await cp(sourcePath, destination, { recursive: true });
    }
  } catch (error) {
    throw new FileSystemError(
      `Failed to copy subdirectory: ${error instanceof Error ? error.message : String(error)}`,
      sourcePath
    );
  }
};

export const extractDirectly = async (
  tarballPath: string,
  destination: string,
  shouldExclude: ((path: string) => boolean) | null
): Promise<void> => {
  await mkdir(destination, { recursive: true });

  await extract({
    cwd: destination,
    file: tarballPath,
    strip: 1,
    ...(shouldExclude
      ? {
          filter: (path) => getNormalizedTarPath(path, undefined, shouldExclude) !== null,
        }
      : {}),
  });
};

export const extractViaTemp = async (
  tarballPath: string,
  destination: string,
  subdir: string,
  shouldExclude: ((path: string) => boolean) | null
): Promise<void> => {
  const tempExtract = await mkdtemp(joinPathSafe(tmpdir(), "baedal-extract-"));

  try {
    await mkdir(tempExtract, { recursive: true });
    await extract({
      cwd: tempExtract,
      file: tarballPath,
      strip: 1,
      ...(shouldExclude
        ? {
            filter: (path) => getNormalizedTarPath(path, subdir, shouldExclude) !== null,
          }
        : {}),
    });

    await copySubdirectory(tempExtract, destination, subdir);
  } finally {
    await rm(tempExtract, { force: true, recursive: true }).catch(() => {
      // Ignore cleanup failures
    });
  }
};

export const extractTarball = async (
  tarballPath: string,
  destination: string,
  subdir?: string,
  exclude?: string[]
): Promise<string[]> => {
  const shouldExclude = exclude?.length
    ? (path: string) => micromatch.isMatch(path, exclude)
    : null;

  try {
    if (subdir) {
      await extractViaTemp(tarballPath, destination, subdir, shouldExclude);
    } else {
      await extractDirectly(tarballPath, destination, shouldExclude);
    }

    return await globby("**/*", {
      cwd: destination,
      dot: true,
      onlyFiles: true,
    });
  } catch (error) {
    if (error instanceof ExtractionError || error instanceof FileSystemError) {
      throw error;
    }
    throw new ExtractionError(
      `Failed to extract tarball: ${error instanceof Error ? error.message : String(error)}`,
      tarballPath,
      error instanceof Error ? error : undefined
    );
  }
};

export const getFileListFromTarball = async (
  tarballPath: string,
  subdir?: string,
  exclude?: string[]
): Promise<string[]> => {
  const files: string[] = [];
  const shouldExclude = exclude?.length
    ? (path: string) => micromatch.isMatch(path, exclude)
    : null;

  try {
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
  } catch (error) {
    throw new ExtractionError(
      `Failed to list tarball contents: ${error instanceof Error ? error.message : String(error)}`,
      tarballPath,
      error instanceof Error ? error : undefined
    );
  }

  return files;
};
