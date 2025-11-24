import { ValidationError } from "../../internal/core/index";
import type { BaedalOptions } from "./types";

const ERROR_MESSAGES = {
  EMPTY_DESTINATION: "Destination cannot be empty. Try: . or ./my-folder",
  EMPTY_EXCLUDE_PATTERNS:
    "Exclude patterns cannot be empty strings.\n" + "Try: ['*.log', 'temp/', 'node_modules/']",
  EMPTY_SOURCE:
    "Source cannot be empty.\n" +
    "Try: user/repo\n" +
    "Or:  github:user/repo\n" +
    "Or:  https://github.com/user/repo",
} as const;

export const validateBaedalOptions = (
  source: string,
  destination: string,
  options?: BaedalOptions
): void => {
  if (!source || source.trim() === "") {
    throw new ValidationError(ERROR_MESSAGES.EMPTY_SOURCE);
  }

  if (!destination || destination.trim() === "") {
    throw new ValidationError(ERROR_MESSAGES.EMPTY_DESTINATION);
  }

  if (options?.exclude?.some((p) => p.trim() === "")) {
    throw new ValidationError(ERROR_MESSAGES.EMPTY_EXCLUDE_PATTERNS);
  }
};
