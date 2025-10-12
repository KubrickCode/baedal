export type Provider = "github" | "gitlab" | "bitbucket";

export const GITHUB_API_URL = "https://api.github.com";
export const GITHUB_ARCHIVE_URL = "https://codeload.github.com/{owner}/{repo}/tar.gz/{branch}";

export const GITLAB_API_URL = "https://gitlab.com/api/v4";
export const GITLAB_ARCHIVE_URL = "https://gitlab.com/{owner}/{repo}/-/archive/{branch}.tar.gz";

export const BITBUCKET_API_URL = "https://api.bitbucket.org/2.0";
export const BITBUCKET_ARCHIVE_URL = "https://bitbucket.org/{owner}/{repo}/get/{branch}.tar.gz";

export const DEFAULT_BRANCH = "main";
