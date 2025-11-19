import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import ky from "ky";
import { getArchiveUrl, getDefaultBranch } from "../../pkg/pull";
import { NetworkError } from "../errors";
import type { Provider } from "../types";

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
    ...(token && { Authorization: `token ${token}` }),
  };

  const response = await ky.get(url, { headers });

  if (!response.body) {
    throw new NetworkError(
      "Failed to download from GitHub: Response body is empty",
      undefined,
      url
    );
  }

  const stream = Readable.fromWeb(response.body);
  const writeStream = createWriteStream(destination);
  await pipeline(stream, writeStream);
};
