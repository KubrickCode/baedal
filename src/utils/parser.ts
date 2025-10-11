import type { RepoInfo } from "../types/index.js";
import { detectProvider } from "../core/providers/detector.js";
import { validateGitLabProject } from "../core/providers/gitlab.js";

export const parseSource = async (source: string): Promise<RepoInfo> => {
  const provider = detectProvider(source);

  let cleanSource = source
    .replace(/^(github|gitlab|bitbucket):/, "")
    .replace(/^https?:\/\/((github|gitlab)\.com|bitbucket\.org)\//, "");

  const parts = cleanSource.split("/");

  if (parts.length < 2) {
    throw new Error(
      "Invalid source format. Use: user/repo, github:user/repo, gitlab:user/repo, bitbucket:user/repo, or full URL"
    );
  }

  if (provider === "gitlab" && parts.length > 2) {
    const { projectPath, subdir } = await validateGitLabProject(parts);

    const pathParts = projectPath.split("/");
    const owner = pathParts[0];
    const repo = pathParts.slice(1).join("/");

    if (!owner || !repo) {
      throw new Error(
        "Invalid source format. Use: user/repo, github:user/repo, gitlab:user/repo, or full URL"
      );
    }

    return subdir
      ? { owner, provider, repo, subdir }
      : { owner, provider, repo };
  }

  const [owner, repo, ...subdirParts] = parts;

  if (!owner || !repo) {
    throw new Error(
      "Invalid source format. Use: user/repo, github:user/repo, gitlab:user/repo, bitbucket:user/repo, or full URL"
    );
  }

  const subdir = subdirParts.join("/");

  return subdir ? { owner, provider, repo, subdir } : { owner, provider, repo };
};
