import { ValidationError } from "../core/errors/";
import type { RepoInfo } from "../core/types/";

export const parseSource = async (source: string): Promise<RepoInfo> => {
  const provider = "github" as const;

  const cleanSource = source.replace(/^github:/, "").replace(/^https?:\/\/github\.com\//, "");

  const parts = cleanSource.split("/");

  if (parts.length < 2) {
    throw new ValidationError(
      "Invalid source format. Use: user/repo, github:user/repo, or GitHub URL"
    );
  }

  const [owner, repo, ...subdirParts] = parts;

  if (!owner || !repo) {
    throw new ValidationError(
      "Invalid source format. Use: user/repo, github:user/repo, or GitHub URL"
    );
  }

  const subdir = subdirParts.join("/");

  return subdir ? { owner, provider, repo, subdir } : { owner, provider, repo };
};
