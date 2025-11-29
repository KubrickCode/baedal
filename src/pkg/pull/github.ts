import { HTTPError } from "ky";
import ky from "ky";
import { GitHubAPIError, NetworkError } from "../../internal/core/errors/";
import { GITHUB_API_URL } from "../../internal/core/types/";
import { GitHubRepositorySchema, parseGitHubResponse } from "../../internal/infra/index.js";

export const getGitHubDefaultBranch = async (
  owner: string,
  repo: string,
  token?: string
): Promise<string> => {
  const headers = token ? { Authorization: `token ${token}` } : {};
  const repoUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}`;

  try {
    const rawData = await ky.get(repoUrl, { headers }).json();
    const data = parseGitHubResponse(GitHubRepositorySchema, rawData, `GET ${repoUrl}`);

    return data.default_branch;
  } catch (error) {
    if (error instanceof HTTPError) {
      const status = error.response.status;

      switch (status) {
        case 404:
          throw new GitHubAPIError(
            `Repository '${owner}/${repo}' not found. Verify the repository exists and you have access.`,
            status,
            repoUrl
          );
        case 401:
          throw new GitHubAPIError(
            `Authentication required for '${owner}/${repo}'. Provide a token with --token option.`,
            status,
            repoUrl
          );
        case 403:
          throw new GitHubAPIError(
            token
              ? `Access forbidden to '${owner}/${repo}'. Your token may lack required permissions.`
              : `Access forbidden to '${owner}/${repo}'. Try providing a token with --token option.`,
            status,
            repoUrl
          );
        default:
          throw new GitHubAPIError(
            `GitHub API error (HTTP ${status}) for '${owner}/${repo}': ${error.message}`,
            status,
            repoUrl
          );
      }
    }

    throw new NetworkError(
      `Failed to connect to GitHub for '${owner}/${repo}': ${error instanceof Error ? error.message : String(error)}`,
      undefined,
      repoUrl
    );
  }
};
