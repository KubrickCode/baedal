export type PushConfig = {
  syncs: SyncConfig[];
  token: string;
};

export type SyncConfig = {
  dest: string;
  repos: string[];
  source: string;
};

export type PushResult = {
  error?: string;
  prUrl?: string;
  repo: string;
  success: boolean;
};

export type PushExecutionResult = {
  failureCount: number;
  results: PushResult[];
  successCount: number;
  totalCount: number;
};

export type CollectedFile = {
  content: string;
  path: string;
  size: number;
};

export type GitHubTreeEntry = {
  content: string;
  mode: "100644" | "100755";
  path: string;
  type: "blob";
};

export type PushInitCLIOptions = {
  force?: boolean;
};
