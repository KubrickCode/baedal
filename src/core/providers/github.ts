import ky from "ky";
import { GITHUB_API_URL, DEFAULT_BRANCH } from "../../types/providers.js";

export const getGitHubDefaultBranch = async (
  owner: string,
  repo: string
): Promise<string> => {
  try {
    const data = await ky
      .get(`${GITHUB_API_URL}/repos/${owner}/${repo}`)
      .json<{ default_branch: string }>();
    return data.default_branch;
  } catch (error) {
    console.error(
      `Failed to fetch GitHub default branch for ${owner}/${repo}:`,
      error
    );
    return DEFAULT_BRANCH;
  }
};
