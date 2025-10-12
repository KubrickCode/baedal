import type { Provider } from "../types/providers.js";

export const getAuthHeaders = (
  provider: Provider,
  token: string,
): Record<string, string> => {
  switch (provider) {
    case "github":
      return { Authorization: `token ${token}` };
    case "gitlab":
      return { "PRIVATE-TOKEN": token };
    case "bitbucket":
      return { Authorization: `Bearer ${token}` };
  }
};
