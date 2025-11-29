import { z } from "zod";

export type PullResult = {
  files: string[];
  path: string;
};

export type ConflictMode =
  | { mode: "force" }
  | { mode: "interactive" }
  | { mode: "modified-only" }
  | { mode: "no-clobber" }
  | { mode: "skip-existing" };

export type BaedalOptions = {
  conflictMode?: ConflictMode;
  exclude?: string[];
  token?: string;
};

export const BaedalOptionsSchema = z
  .object({
    conflictMode: z
      .object({
        mode: z.enum(["force", "interactive", "modified-only", "no-clobber", "skip-existing"]),
      })
      .optional(),
    exclude: z
      .array(
        z.string().refine((val) => val.trim().length > 0, {
          message: "Exclude patterns cannot be empty strings",
        })
      )
      .optional(),
    token: z.string().min(1, "Token cannot be empty").optional(),
  })
  .strict();
