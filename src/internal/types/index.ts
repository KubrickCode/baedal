import type { Provider } from "./providers.js";

export type PullResult = {
  files: string[];
  path: string;
};

export type RepoInfo = {
  owner: string;
  provider: Provider;
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
