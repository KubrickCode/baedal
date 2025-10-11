import type { Provider } from "./providers.js";

export type DownloadResult = {
  files: string[];
  path: string;
};

export type RepoInfo = {
  owner: string;
  provider: Provider;
  repo: string;
  subdir?: string;
};

export type BaedalOptions = {
  exclude?: string[];
  force?: boolean;
  noClobber?: boolean;
  skipExisting?: boolean;
  token?: string;
};

export type FileCheckResult = {
  toAdd: string[];
  toOverwrite: string[];
};
