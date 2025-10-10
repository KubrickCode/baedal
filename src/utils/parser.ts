import type { RepoInfo } from "../types/index.js";

export const parseSource = (source: string): RepoInfo => {
  const [owner, repo, ...subdirParts] = source.split("/");

  if (!owner || !repo) {
    throw new Error("Invalid source format. Use: user/repo or user/repo/path");
  }

  const subdir = subdirParts.join("/");

  return subdir ? { owner, repo, subdir } : { owner, repo };
};
