import { access, constants } from "node:fs/promises";
import { join } from "node:path";
import type { FileCheckResult } from "../types/index.js";

export const checkExistingFiles = async (
  files: string[],
  destination: string,
): Promise<FileCheckResult> => {
  const toOverwrite: string[] = [];
  const toAdd: string[] = [];

  await Promise.all(
    files.map(async (file) => {
      const filePath = join(destination, file);
      try {
        await access(filePath, constants.F_OK);
        toOverwrite.push(file);
      } catch {
        toAdd.push(file);
      }
    }),
  );

  return { toAdd, toOverwrite };
};
