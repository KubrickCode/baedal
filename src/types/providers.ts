// TODO: Multi-provider support planned for after MVP (GitLab, Bitbucket)
export type Provider = "github";

export const GITHUB_API_URL = "https://api.github.com";
export const GITHUB_ARCHIVE_URL = "https://codeload.github.com/{owner}/{repo}/tar.gz/{branch}";

export const DEFAULT_BRANCH = "main";
