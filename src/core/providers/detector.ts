import type { Provider } from "../../types/providers.js";

export const detectProvider = (source: string): Provider => {
  void source;
  return "github";
};
