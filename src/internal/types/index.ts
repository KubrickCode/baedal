import type { Provider as ProviderType } from "./providers";

export type { Provider } from "./providers";
export { DEFAULT_BRANCH, GITHUB_API_URL, GITHUB_ARCHIVE_URL } from "./providers";

export type PullResult = {
  files: string[];
  path: string;
};

export type RepoInfo = {
  owner: string;
  provider: ProviderType;
  repo: string;
  subdir?: string;
};

export type ConflictMode =
  | { mode: "force" }
  | { mode: "skip-existing" }
  | { mode: "no-clobber" }
  | { mode: "interactive" };

export type BaedalOptions = {
  conflictMode?: ConflictMode;
  exclude?: string[];
  token?: string;
};

export type FileCheckResult = {
  toAdd: string[];
  toOverwrite: string[];
};
