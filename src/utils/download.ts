import ky from "ky";
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
    const data = await ky
      .get(`${GITHUB_API_URL}/repos/${owner}/${repo}`)
      .json<{ default_branch: string }>();
    return data.default_branch;
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
    const data = await ky
      .get(`${GITLAB_API_URL}/projects/${projectPath}`)
      .json<{ default_branch: string }>();
    return data.default_branch;
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

  // GitLab requires mode: 'same-origin' to avoid 406 error due to hotlinking protection
  // Reference: https://github.com/unjs/giget/issues/97
  const response = await ky.get(url, {
    ...(provider === "gitlab" && { mode: "same-origin" as const }),
    headers: {
      Accept: "application/octet-stream, */*",
    },
  });

  if (!response.body) {
    throw new Error(
      `Failed to download from ${
        provider === "gitlab" ? "GitLab" : "GitHub"
      }: Response body is empty`
    );
  }

  const stream = Readable.fromWeb(response.body);
  const writeStream = createWriteStream(destination);
  await pipeline(stream, writeStream);
};
