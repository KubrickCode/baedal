import ky, { HTTPError } from "ky";
import { GITLAB_API_URL, DEFAULT_BRANCH } from "../../types/providers.js";
import { getAuthHeaders } from "../../utils/auth.js";

const GITLAB_VALIDATION_MAX_ATTEMPTS = 5;
const GITLAB_API_TIMEOUT_MS = 5000;

export const validateGitLabProject = async (
  parts: string[],
  token?: string
): Promise<{ projectPath: string; subdir?: string }> => {
  const maxAttempts = Math.min(parts.length, GITLAB_VALIDATION_MAX_ATTEMPTS);

  for (let i = parts.length; i >= 2; i--) {
    if (parts.length - i >= maxAttempts) break;

    const projectPath = parts.slice(0, i).join("/");

    try {
      const encodedPath = encodeURIComponent(projectPath);
      const url = `${GITLAB_API_URL}/projects/${encodedPath}`;

      const headers = token ? getAuthHeaders("gitlab", token) : {};

      await ky.get(url, {
        headers,
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
  throw new Error(`Could not find a valid GitLab project for: ${parts.join("/")}`);
};

export const getGitLabDefaultBranch = async (
  owner: string,
  repo: string,
  token?: string
): Promise<string> => {
  try {
    const projectPath = encodeURIComponent(`${owner}/${repo}`);
    const headers = token ? getAuthHeaders("gitlab", token) : {};

    const data = await ky
      .get(`${GITLAB_API_URL}/projects/${projectPath}`, {
        headers,
      })
      .json<{ default_branch: string }>();
    return data.default_branch;
  } catch (error) {
    console.error(`Failed to fetch GitLab default branch for ${owner}/${repo}:`, error);
    return DEFAULT_BRANCH;
  }
};
