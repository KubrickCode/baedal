import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { FileSystemError } from "../core/index";

const HASH_ALGORITHM = "sha256";

const calculateFileHash = async (filePath: string): Promise<string> => {
  const hash = createHash(HASH_ALGORITHM);
  const stream = createReadStream(filePath);

  try {
    await pipeline(stream, hash);
    return hash.digest("hex");
  } catch (err) {
    throw new FileSystemError(
      `Failed to calculate hash for file: ${filePath}. ${err instanceof Error ? err.message : String(err)}`,
      filePath
    );
  }
};

export const compareFileHash = async (path1: string, path2: string): Promise<boolean> => {
  const [hash1, hash2] = await Promise.all([calculateFileHash(path1), calculateFileHash(path2)]);
  return hash1 === hash2;
};
