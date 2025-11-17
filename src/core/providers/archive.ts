import { GITHUB_ARCHIVE_URL, type Provider } from "../../types/providers.js";
import { getGitHubDefaultBranch } from "./github.js";

export const getDefaultBranch = async (
  owner: string,
  repo: string,
  provider: Provider,
  token?: string
): Promise<string> => {
  void provider;
  return getGitHubDefaultBranch(owner, repo, token);
};

type GetArchiveUrlParams = {
  branch: string;
  owner: string;
  provider: Provider;
  repo: string;
  subdir?: string;
};

export const getArchiveUrl = ({
  branch,
  owner,
  provider,
  repo,
  subdir,
}: GetArchiveUrlParams): string => {
  void provider;
  void subdir;

  return GITHUB_ARCHIVE_URL.replace(/{owner}/g, owner)
    .replace(/{repo}/g, repo)
    .replace(/{branch}/g, branch);
};
