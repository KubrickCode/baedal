import ky from "ky";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import type { Provider } from "../types/providers.js";
import { getDefaultBranch, getArchiveUrl } from "../core/providers/archive.js";
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
      github: "GitHub",
      gitlab: "GitLab",
      bitbucket: "Bitbucket",
    };
    const providerName = providerNameMap[provider];
    throw new Error(
      `Failed to download from ${providerName}: Response body is empty`
    );
  }

  const stream = Readable.fromWeb(response.body);
  const writeStream = createWriteStream(destination);
  await pipeline(stream, writeStream);
};
