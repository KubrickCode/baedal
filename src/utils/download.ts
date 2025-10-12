import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import ky from "ky";
import { getDefaultBranch, getArchiveUrl } from "../core/providers/archive.js";
import type { Provider } from "../types/providers.js";
import { getAuthHeaders } from "./auth.js";

export const downloadTarball = async (
  owner: string,
  repo: string,
  destination: string,
  provider: Provider,
  subdir?: string,
  token?: string
): Promise<void> => {
  const branch = await getDefaultBranch(owner, repo, provider, token);
  const url = getArchiveUrl({
    branch,
    owner,
    provider,
    repo,
    ...(subdir && { subdir }),
  });

  const headers: Record<string, string> = {
    Accept: "application/octet-stream, */*",
    ...(token && getAuthHeaders(provider, token)),
  };

  // GitLab requires mode: 'same-origin' to avoid 406 error due to hotlinking protection
  // Reference: https://github.com/unjs/giget/issues/97
  const response = await ky.get(url, {
    ...(provider === "gitlab" && { mode: "same-origin" as const }),
    headers,
  });

  if (!response.body) {
    const providerNameMap: Record<Provider, string> = {
      bitbucket: "Bitbucket",
      github: "GitHub",
      gitlab: "GitLab",
    };
    const providerName = providerNameMap[provider];
    throw new Error(`Failed to download from ${providerName}: Response body is empty`);
  }

  const stream = Readable.fromWeb(response.body);
  const writeStream = createWriteStream(destination);
  await pipeline(stream, writeStream);
};
