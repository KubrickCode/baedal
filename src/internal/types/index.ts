import type { Provider as ProviderType } from "./providers";

export type { Provider } from "./providers";
export { DEFAULT_BRANCH, GITHUB_API_URL, GITHUB_ARCHIVE_URL } from "./providers";

export type RepoInfo = {
  owner: string;
  provider: ProviderType;
  repo: string;
  subdir?: string;
};

export type FileCheckResult = {
  toAdd: string[];
  toOverwrite: string[];
};
