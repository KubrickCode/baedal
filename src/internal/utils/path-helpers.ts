import { join } from "node:path";

export const joinPathSafe = (...paths: string[]): string => {
  const validPaths = paths.filter((p) => p && p.length > 0);

  if (validPaths.length === 0) {
    return "";
  }

  return join(...validPaths);
};

/**
 * Normalizes a GitHub path to Unix-style forward slashes.
 * GitHub API always uses forward slashes, not backslashes.
 */
export const normalizeGitHubPath = (path: string): string => {
  if (!path) {
    return "";
  }

  return path
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
};

/**
 * Removes the root directory from a tarball entry path.
 * GitHub tarballs always include a root directory like "owner-repo-ref/".
 */
export const stripRootDirectory = (path: string): string => {
  if (!path) {
    return "";
  }

  const firstSlashIndex = path.indexOf("/");

  if (firstSlashIndex === -1) {
    return "";
  }

  return path.substring(firstSlashIndex + 1);
};
