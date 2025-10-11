export type Provider = "github" | "gitlab";

export const GITHUB_API_URL = "https://api.github.com";
export const GITHUB_ARCHIVE_URL =
  "https://codeload.github.com/{owner}/{repo}/tar.gz/{branch}";

export const GITLAB_API_URL = "https://gitlab.com/api/v4";
export const GITLAB_ARCHIVE_URL =
  "https://gitlab.com/{owner}/{repo}/-/archive/{branch}.tar.gz";

export const DEFAULT_BRANCH = "main";
