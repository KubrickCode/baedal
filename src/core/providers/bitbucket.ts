import ky from "ky";
import { BITBUCKET_API_URL, DEFAULT_BRANCH } from "../../types/providers.js";

type BitbucketRepoResponse = {
  mainbranch: {
    name: string;
  };
};

export const getBitbucketDefaultBranch = async (
  owner: string,
  repo: string
): Promise<string> => {
  try {
    const data = await ky
      .get(`${BITBUCKET_API_URL}/repositories/${owner}/${repo}`)
      .json<BitbucketRepoResponse>();
    return data.mainbranch.name;
  } catch (error) {
    console.error(
      `Failed to fetch Bitbucket default branch for ${owner}/${repo}:`,
      error
    );
    return DEFAULT_BRANCH;
  }
};
