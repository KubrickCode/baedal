import ky from "ky";
import { DEFAULT_BRANCH, GITHUB_API_URL } from "../../internal/core/types/";
import { GitHubRepositorySchema, parseGitHubResponse } from "../../internal/infra/index.js";

export const getGitHubDefaultBranch = async (
  owner: string,
  repo: string,
  token?: string
): Promise<string> => {
  try {
    const headers = token ? { Authorization: `token ${token}` } : {};
    const repoUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}`;

    const rawData = await ky.get(repoUrl, { headers }).json();
    const data = parseGitHubResponse(GitHubRepositorySchema, rawData, `GET ${repoUrl}`);

    return data.default_branch;
  } catch (error) {
    console.error(`Failed to fetch GitHub default branch for ${owner}/${repo}:`, error);
    return DEFAULT_BRANCH;
  }
};
