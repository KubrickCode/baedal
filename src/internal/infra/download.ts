import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import ky from "ky";
import { NetworkError } from "../core/errors/index";

/**
 * Downloads a file from a URL to the specified destination.
 * Infrastructure layer: pure HTTP download without domain logic.
 */
export const downloadStream = async (
  url: string,
  destination: string,
  token?: string
): Promise<void> => {
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
