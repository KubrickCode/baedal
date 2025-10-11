import type { Provider } from "../../types/providers.js";

export const detectProvider = (source: string): Provider => {
  if (source.startsWith("gitlab:") || source.includes("gitlab.com")) {
    return "gitlab";
  }
  return "github";
};
