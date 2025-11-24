import { z } from "zod";
import { NetworkError, ValidationError } from "../core/errors/index.js";

type ErrorType = "validation" | "network";

export const parseWithZod = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string,
  errorType: ErrorType = "validation"
): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorDetails = error.issues
        .map((e) => (e.path.length > 0 ? `${e.path.join(".")}: ` : "") + e.message)
        .join(", ");

      if (errorType === "network") {
        throw new NetworkError(`Invalid response (${context}): ${errorDetails}`);
      }

      throw new ValidationError(`Invalid ${context}: ${errorDetails}`);
    }
    throw error;
  }
};
