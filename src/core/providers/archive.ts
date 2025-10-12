import {
  GITHUB_ARCHIVE_URL,
  GITLAB_ARCHIVE_URL,
  BITBUCKET_ARCHIVE_URL,
  type Provider,
} from "../../types/providers.js";
import { getBitbucketDefaultBranch } from "./bitbucket.js";
import { getGitHubDefaultBranch } from "./github.js";
import { getGitLabDefaultBranch } from "./gitlab.js";

export const getDefaultBranch = async (
  owner: string,
  repo: string,
  provider: Provider,
  token?: string
): Promise<string> => {
  switch (provider) {
    case "gitlab":
      return getGitLabDefaultBranch(owner, repo, token);
    case "bitbucket":
      return getBitbucketDefaultBranch(owner, repo, token);
    default:
      return getGitHubDefaultBranch(owner, repo, token);
  }
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
  let template: string;

  switch (provider) {
    case "gitlab":
      template = GITLAB_ARCHIVE_URL;
      break;
    case "bitbucket":
      template = BITBUCKET_ARCHIVE_URL;
      break;
    default:
      template = GITHUB_ARCHIVE_URL;
      break;
  }

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
