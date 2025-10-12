import ky from "ky";
import { BITBUCKET_API_URL, DEFAULT_BRANCH } from "../../types/providers.js";
import { getAuthHeaders } from "../../utils/auth.js";

type BitbucketRepoResponse = {
  mainbranch: {
    name: string;
  };
};

export const getBitbucketDefaultBranch = async (
  owner: string,
  repo: string,
  token?: string
): Promise<string> => {
  try {
    const headers = token ? getAuthHeaders("bitbucket", token) : {};

    const data = await ky
      .get(`${BITBUCKET_API_URL}/repositories/${owner}/${repo}`, {
        headers,
      })
      .json<BitbucketRepoResponse>();
    return data.mainbranch.name;
  } catch (error) {
    console.error(`Failed to fetch Bitbucket default branch for ${owner}/${repo}:`, error);
    return DEFAULT_BRANCH;
  }
};
