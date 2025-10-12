import ky from "ky";
import { GITHUB_API_URL, DEFAULT_BRANCH } from "../../types/providers.js";
import { getAuthHeaders } from "../../utils/auth.js";

export const getGitHubDefaultBranch = async (
  owner: string,
  repo: string,
  token?: string
): Promise<string> => {
  try {
    const headers = token ? getAuthHeaders("github", token) : {};

    const data = await ky
      .get(`${GITHUB_API_URL}/repos/${owner}/${repo}`, {
        headers,
      })
      .json<{ default_branch: string }>();
    return data.default_branch;
  } catch (error) {
    console.error(`Failed to fetch GitHub default branch for ${owner}/${repo}:`, error);
    return DEFAULT_BRANCH;
  }
};
