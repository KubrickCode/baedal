import { z } from "zod";

/**
 * Git file mode (Unix octal format)
 * - "100644": Normal file (rw-r--r--)
 * - "100755": Executable file (rwxr-xr-x)
 */
export type GitFileMode = "100644" | "100755";

export const GIT_FILE_MODES = {
  EXECUTABLE: "100755",
  NORMAL: "100644",
} as const;

export const SyncConfigSchema = z.object({
  dest: z.string(),
  repos: z.array(z.string()),
  source: z.string(),
});
export type SyncConfig = z.infer<typeof SyncConfigSchema>;

export const PushConfigSchema = z.object({
  syncs: z.array(SyncConfigSchema),
  token: z.string(),
});
export type PushConfig = z.infer<typeof PushConfigSchema>;

export type CategorizedResults = {
  failed: PushResult[];
  successful: PushResult[];
};

export type CollectedFile = {
  content: string;
  mode?: GitFileMode;
  path: string;
  size: number;
};

export type ProcessRepositoryOptions = {
  branchName: string;
  destPath: string;
  repoName: string;
  sourcePath: string;
  syncName: string;
  token: string;
};

export type PushExecutionResult = {
  failureCount: number;
  results: PushResult[];
  successCount: number;
  totalCount: number;
};

export type PushInitCLIOptions = {
  force?: boolean;
};

export type PushResult = {
  error?: string;
  prUrl?: string;
  repo: string;
  success: boolean;
};
