import { ValidationError } from "../../internal/core/errors/";
import { GITHUB_ARCHIVE_URL, type Provider } from "../../internal/core/types/";
import { getGitHubDefaultBranch } from "./github";

export const getDefaultBranch = async (
  owner: string,
  repo: string,
  provider: Provider,
  token?: string
): Promise<string> => {
  switch (provider) {
    case "github":
      return getGitHubDefaultBranch(owner, repo, token);
    default:
      throw new ValidationError(`Unsupported provider: ${provider}`);
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
  void subdir;

  switch (provider) {
    case "github":
      return GITHUB_ARCHIVE_URL.replace(/{owner}/g, owner)
        .replace(/{repo}/g, repo)
        .replace(/{branch}/g, branch);
    default:
      throw new ValidationError(`Unsupported provider: ${provider}`);
  }
};
