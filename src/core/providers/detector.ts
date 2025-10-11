import type { Provider } from "../../types/providers.js";

export const detectProvider = (source: string): Provider => {
  if (source.startsWith("gitlab:") || source.includes("gitlab.com")) {
    return "gitlab";
  }
  if (source.startsWith("bitbucket:") || source.includes("bitbucket.org")) {
    return "bitbucket";
  }
  return "github";
};
