import { ValidationError } from "../core/errors/";
import type { RepoInfo } from "../core/types/";

export const parseSource = async (source: string): Promise<RepoInfo> => {
  const provider = "github" as const;

  const cleanSource = source.replace(/^github:/, "").replace(/^https?:\/\/github\.com\//, "");

  // Split by # to handle fragments (e.g., user/repo#subdir)
  const [repoPath = "", fragment] = cleanSource.split("#");
  const parts = repoPath.split("/");
  const [owner, repo] = parts;

  if (!owner || !repo) {
    throw new ValidationError(
      `Invalid source format.
Try: user/repo
Or:  github:user/repo
Or:  https://github.com/user/repo`
    );
  }

  // Subdir can come from path (user/repo/subdir) or fragment (user/repo#subdir)
  const pathSubdir = parts.slice(2).join("/");
  const subdir = fragment || pathSubdir;

  return subdir ? { owner, provider, repo, subdir } : { owner, provider, repo };
};
