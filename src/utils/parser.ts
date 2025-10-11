import ky, { HTTPError } from "ky";
import type { RepoInfo } from "../types/index.js";
import type { Provider } from "../types/providers.js";
import { GITLAB_API_URL } from "../types/providers.js";

const GITLAB_VALIDATION_MAX_ATTEMPTS = 5;
const GITLAB_API_TIMEOUT_MS = 5000;

const detectProvider = (source: string): Provider => {
  if (source.startsWith("gitlab:") || source.includes("gitlab.com")) {
    return "gitlab";
  }
  if (source.startsWith("github:") || source.includes("github.com")) {
    return "github";
  }
  return "github";
};

const validateGitLabProject = async (
  parts: string[]
): Promise<{ projectPath: string; subdir?: string }> => {
  const maxAttempts = Math.min(parts.length, GITLAB_VALIDATION_MAX_ATTEMPTS);

  for (let i = parts.length; i >= 2; i--) {
    if (parts.length - i >= maxAttempts) break;

    const projectPath = parts.slice(0, i).join("/");

    try {
      const encodedPath = encodeURIComponent(projectPath);
      const url = `${GITLAB_API_URL}/projects/${encodedPath}`;

      await ky.get(url, {
        timeout: GITLAB_API_TIMEOUT_MS,
      });

      const subdir = parts.slice(i).join("/");
      return subdir ? { projectPath, subdir } : { projectPath };
    } catch (error) {
      // Only continue for 404 errors (project not found)
      // Re-throw other errors (network issues, timeouts, etc.)
      if (error instanceof HTTPError && error.response.status === 404) {
        continue;
      }
      throw error;
    }
  }

  // If no valid project found after all attempts, throw error
  throw new Error(
    `Could not find a valid GitLab project for: ${parts.join("/")}`
  );
};

export const parseSource = async (source: string): Promise<RepoInfo> => {
  const provider = detectProvider(source);

  let cleanSource = source
    .replace(/^(github|gitlab):/, "")
    .replace(/^https?:\/\/(github|gitlab)\.com\//, "");

  const parts = cleanSource.split("/");

  if (parts.length < 2) {
    throw new Error(
      "Invalid source format. Use: user/repo, github:user/repo, gitlab:user/repo, or full URL"
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
      "Invalid source format. Use: user/repo, github:user/repo, gitlab:user/repo, or full URL"
    );
  }

  const subdir = subdirParts.join("/");

  return subdir ? { owner, provider, repo, subdir } : { owner, provider, repo };
};
