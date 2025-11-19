import { Octokit } from "@octokit/rest";

const TOKEN_ENV_VARS = ["GITHUB_TOKEN", "GH_TOKEN"] as const;
const DEFAULT_USER_AGENT = "baedal/1.0";

export const getTokenFromEnv = (): string | undefined => {
  for (const envVar of TOKEN_ENV_VARS) {
    const token = process.env[envVar];
    if (token?.trim()) {
      return token;
    }
  }
  return undefined;
};

export const createGitHubClient = (token?: string): Octokit => {
  const normalizedToken = token?.trim() || undefined;
  const authToken = normalizedToken ?? getTokenFromEnv();

  return new Octokit({
    ...(authToken && { auth: authToken }),
    userAgent: DEFAULT_USER_AGENT,
  });
};
