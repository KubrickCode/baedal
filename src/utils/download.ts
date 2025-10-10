import { ofetch } from "ofetch";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import {
  GITHUB_API_URL,
  GITHUB_ARCHIVE_URL,
  DEFAULT_BRANCH,
} from "../types/providers.js";

const getDefaultBranch = async (
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

export const downloadTarball = async (
  owner: string,
  repo: string,
  destination: string
): Promise<void> => {
  const branch = await getDefaultBranch(owner, repo);
  const url = GITHUB_ARCHIVE_URL.replace("{owner}", owner)
    .replace("{repo}", repo)
    .replace("{branch}", branch);

  const response = await ofetch(url, { responseType: "stream" });
  const writeStream = createWriteStream(destination);

  await pipeline(response, writeStream);
};
