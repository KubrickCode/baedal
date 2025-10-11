import { ofetch } from "ofetch";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import {
  GITHUB_API_URL,
  GITHUB_ARCHIVE_URL,
  GITLAB_API_URL,
  GITLAB_ARCHIVE_URL,
  DEFAULT_BRANCH,
  type Provider,
} from "../types/providers.js";

const getGitHubDefaultBranch = async (
  owner: string,
  repo: string
): Promise<string> => {
  try {
    const response = await ofetch<{ default_branch: string }>(
      `${GITHUB_API_URL}/repos/${owner}/${repo}`
    );
    return response.default_branch;
  } catch {
    return DEFAULT_BRANCH;
  }
};

const getGitLabDefaultBranch = async (
  owner: string,
  repo: string
): Promise<string> => {
  try {
    const projectPath = encodeURIComponent(`${owner}/${repo}`);
    const response = await ofetch<{ default_branch: string }>(
      `${GITLAB_API_URL}/projects/${projectPath}`
    );
    return response.default_branch;
  } catch {
    return DEFAULT_BRANCH;
  }
};

const getDefaultBranch = async (
  owner: string,
  repo: string,
  provider: Provider
): Promise<string> => {
  return provider === "gitlab"
    ? getGitLabDefaultBranch(owner, repo)
    : getGitHubDefaultBranch(owner, repo);
};

const getArchiveUrl = (
  owner: string,
  repo: string,
  branch: string,
  provider: Provider,
  subdir?: string
): string => {
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

export const downloadTarball = async (
  owner: string,
  repo: string,
  destination: string,
  provider: Provider,
  subdir?: string
): Promise<void> => {
  const branch = await getDefaultBranch(owner, repo, provider);
  const url = getArchiveUrl(owner, repo, branch, provider, subdir);

  // TODO: Unify fetch and ofetch usage
  // Currently using native fetch for GitLab and ofetch for GitHub
  // This could be simplified if ofetch supports mode: 'same-origin' option
  //
  // Use native fetch for GitLab with mode: 'same-origin' to avoid 406 error
  // Reference: https://github.com/unjs/giget/issues/97
  // GitLab has hotlinking protection that requires this mode

  // Create readable stream based on provider
  let stream;

  if (provider === "gitlab") {
    const response = await fetch(url, {
      mode: "same-origin",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to download from GitLab: ${response.status} ${response.statusText}`
      );
    }

    if (!response.body) {
      throw new Error("Failed to download from GitLab: Response body is empty");
    }

    stream = Readable.fromWeb(response.body);
  } else {
    stream = await ofetch(url, {
      responseType: "stream",
      headers: {
        Accept: "application/octet-stream, */*",
      },
    });
  }

  const writeStream = createWriteStream(destination);
  await pipeline(stream, writeStream);
};
