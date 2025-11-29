import { Octokit } from "@octokit/rest";
import { isEmpty } from "es-toolkit/compat";

const TOKEN_ENV_VARS = ["GITHUB_TOKEN", "GH_TOKEN"] as const;
const DEFAULT_USER_AGENT = "baedal/1.0";

export const getTokenFromEnv = (): string | undefined => {
  for (const envVar of TOKEN_ENV_VARS) {
    const token = process.env[envVar];
    if (!isEmpty(token?.trim())) {
      return token;
    }
  }
  return undefined;
};

export const createGitHubClient = (token?: string): Octokit => {
  const normalizedToken = isEmpty(token?.trim()) ? undefined : token?.trim();
  const authToken = normalizedToken ?? getTokenFromEnv();

  return new Octokit({
    ...(authToken && { auth: authToken }),
    userAgent: DEFAULT_USER_AGENT,
  });
};
