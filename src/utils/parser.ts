import { detectProvider } from "../core/providers/detector.js";
import type { RepoInfo } from "../types/index.js";

export const parseSource = async (source: string, _token?: string): Promise<RepoInfo> => {
  const provider = detectProvider(source);

  const cleanSource = source.replace(/^github:/, "").replace(/^https?:\/\/github\.com\//, "");

  const parts = cleanSource.split("/");

  if (parts.length < 2) {
    throw new Error("Invalid source format. Use: user/repo, github:user/repo, or GitHub URL");
  }

  const [owner, repo, ...subdirParts] = parts;

  if (!owner || !repo) {
    throw new Error("Invalid source format. Use: user/repo, github:user/repo, or GitHub URL");
  }

  const subdir = subdirParts.join("/");

  return subdir ? { owner, provider, repo, subdir } : { owner, provider, repo };
};
