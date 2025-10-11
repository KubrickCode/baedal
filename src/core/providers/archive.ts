import {
  GITHUB_ARCHIVE_URL,
  GITLAB_ARCHIVE_URL,
  type Provider,
} from "../../types/providers.js";
import { getGitHubDefaultBranch } from "./github.js";
import { getGitLabDefaultBranch } from "./gitlab.js";

export const getDefaultBranch = async (
  owner: string,
  repo: string,
  provider: Provider
): Promise<string> => {
  return provider === "gitlab"
    ? getGitLabDefaultBranch(owner, repo)
    : getGitHubDefaultBranch(owner, repo);
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
  const template =
    provider === "gitlab" ? GITLAB_ARCHIVE_URL : GITHUB_ARCHIVE_URL;

  let url = template
    .replace(/{owner}/g, owner)
    .replace(/{repo}/g, repo)
    .replace(/{branch}/g, branch);

  // Add path parameter for GitLab subdirectory downloads
  // This significantly reduces download size by filtering at the server side
  if (provider === "gitlab" && subdir) {
    url += `?path=${subdir}`;
  }

  return url;
};
