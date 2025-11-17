import type { BaedalOptions, ConflictMode } from "../internal/types/index.js";
import type { PullCLIOptions } from "./types.js";

const validateConflictFlags = (options: PullCLIOptions): void => {
  const conflictFlags = [options.force, options.skipExisting, options.noClobber].filter(Boolean);

  if (conflictFlags.length > 1) {
    throw new Error("Cannot use --force, --skip-existing, and --no-clobber together");
  }
};

const resolveConflictMode = (options: PullCLIOptions): ConflictMode | undefined => {
  if (options.force) return { mode: "force" };
  if (options.skipExisting) return { mode: "skip-existing" };
  if (options.noClobber) return { mode: "no-clobber" };
  return undefined; // Library defaults to interactive
};

const resolveToken = (cliToken: string | undefined): string | undefined => {
  return cliToken ?? process.env.GITHUB_TOKEN ?? process.env.BAEDAL_TOKEN;
};

export const adaptCLIOptions = (cliOptions: PullCLIOptions): BaedalOptions => {
  validateConflictFlags(cliOptions);

  const conflictMode = resolveConflictMode(cliOptions);
  const token = resolveToken(cliOptions.token);

  return {
    ...(conflictMode && { conflictMode }),
    ...(cliOptions.exclude && { exclude: cliOptions.exclude }),
    ...(token && { token }),
  };
};
