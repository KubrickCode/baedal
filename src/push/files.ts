import { readFile, stat } from "node:fs/promises";
import { join, normalize, relative } from "node:path";
import { globby } from "globby";
import type { CollectedFile } from "./types.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const getFileSize = async (filePath: string): Promise<number> => {
  const stats = await stat(filePath);
  return stats.size;
};

export const normalizePath = (path: string): string => {
  let normalized = normalize(path);
  normalized = normalized.replace(/^[./\\]+/, "");
  normalized = normalized.replace(/\\/g, "/");
  return normalized;
};

export const getRelativePath = (basePath: string, targetPath: string): string => {
  const rel = relative(basePath, targetPath);
  return normalizePath(rel);
};

const collectSingleFile = async (
  absolutePath: string,
  originalPath: string
): Promise<CollectedFile[]> => {
  const size = await getFileSize(absolutePath);

  if (size > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds maximum (${
        MAX_FILE_SIZE / 1024 / 1024
      }MB)`
    );
  }

  const content = await readFile(absolutePath, "utf-8");
  const path = normalizePath(originalPath);

  return [
    {
      content,
      path,
      size,
    },
  ];
};

const collectDirectory = async (
  absolutePath: string,
  baseDir: string,
  originalPath: string
): Promise<CollectedFile[]> => {
  const pattern = join(absolutePath, "**", "*");
  const filePaths = await globby(pattern, {
    dot: true,
    gitignore: false,
    onlyFiles: true,
  });

  if (filePaths.length === 0) {
    throw new Error(`No files found in directory: ${originalPath}`);
  }

  const collected: CollectedFile[] = [];

  for (const filePath of filePaths) {
    try {
      const size = await getFileSize(filePath);

      if (size > MAX_FILE_SIZE) {
        console.warn(
          `Skipping ${filePath}: file size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds maximum`
        );
        continue;
      }

      const content = await readFile(filePath, "utf-8");
      const relativePath = getRelativePath(baseDir, filePath);

      collected.push({
        content,
        path: relativePath,
        size,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipping ${filePath}: ${message}`);
    }
  }

  if (collected.length === 0) {
    throw new Error(`No valid files could be collected from: ${originalPath}`);
  }

  return collected;
};

export const collectFiles = async (
  sourcePath: string,
  baseDir?: string
): Promise<CollectedFile[]> => {
  const base = baseDir ?? process.cwd();
  const absoluteSource = join(base, sourcePath);

  const stats = await stat(absoluteSource);

  if (stats.isFile()) {
    return await collectSingleFile(absoluteSource, sourcePath);
  }

  if (stats.isDirectory()) {
    return await collectDirectory(absoluteSource, base, sourcePath);
  }

  throw new Error(`Path is neither a file nor a directory: ${sourcePath}`);
};
