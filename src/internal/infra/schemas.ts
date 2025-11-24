import { z } from "zod";
import { parseWithZod } from "../utils/index.js";

export const GitHubRepositorySchema = z.object({
  default_branch: z.string().min(1, "default_branch must not be empty"),
});

export const parseGitHubResponse = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T => {
  return parseWithZod(schema, data, `GitHub API response (${context})`, "network");
};
