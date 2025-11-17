import type { BaedalOptions, ConflictMode } from "../types/index.js";
import type { DownloadCLIOptions } from "./types.js";

const validateConflictFlags = (options: DownloadCLIOptions): void => {
  const conflictFlags = [options.force, options.skipExisting, options.noClobber].filter(Boolean);

  if (conflictFlags.length > 1) {
    throw new Error("Cannot use --force, --skip-existing, and --no-clobber together");
  }
};

const resolveConflictMode = (options: DownloadCLIOptions): ConflictMode | undefined => {
  if (options.force) return { mode: "force" };
  if (options.skipExisting) return { mode: "skip-existing" };
  if (options.noClobber) return { mode: "no-clobber" };
  return undefined; // Library defaults to interactive
};

const resolveToken = (cliToken: string | undefined): string | undefined => {
  return cliToken ?? process.env.GITHUB_TOKEN ?? process.env.BAEDAL_TOKEN;
};

export const adaptCLIOptions = (cliOptions: DownloadCLIOptions): BaedalOptions => {
  validateConflictFlags(cliOptions);

  const conflictMode = resolveConflictMode(cliOptions);
  const token = resolveToken(cliOptions.token);

  return {
    ...(conflictMode && { conflictMode }),
    ...(cliOptions.exclude && { exclude: cliOptions.exclude }),
    ...(token && { token }),
  };
};
