import { parseWithZod } from "../internal/utils/";
import type { BaedalOptions, ConflictMode } from "../pkg/pull/types";
import type { PullCLIOptions } from "./types";
import { PullCLIOptionsSchema } from "./types";

const resolveConflictMode = (options: PullCLIOptions): ConflictMode | undefined => {
  if (options.force) return { mode: "force" };
  if (options.modifiedOnly) return { mode: "modified-only" };
  if (options.noClobber || options.clobber === false) return { mode: "no-clobber" };
  if (options.skipExisting) return { mode: "skip-existing" };
  return undefined; // Library defaults to interactive
};

const resolveToken = (cliToken: string | undefined): string | undefined => {
  return cliToken ?? process.env.GITHUB_TOKEN ?? process.env.BAEDAL_TOKEN;
};

export const adaptCLIOptions = (cliOptions: PullCLIOptions): BaedalOptions => {
  parseWithZod(PullCLIOptionsSchema, cliOptions, "CLI options");

  const conflictMode = resolveConflictMode(cliOptions);
  const token = resolveToken(cliOptions.token);

  return {
    ...(conflictMode && { conflictMode }),
    ...(cliOptions.exclude && { exclude: cliOptions.exclude }),
    ...(token && { token }),
  };
};
