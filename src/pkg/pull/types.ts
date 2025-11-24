import { z } from "zod";

export type PullResult = {
  files: string[];
  path: string;
};

export type ConflictMode =
  | { mode: "force" }
  | { mode: "skip-existing" }
  | { mode: "no-clobber" }
  | { mode: "interactive" };

export type BaedalOptions = {
  conflictMode?: ConflictMode;
  exclude?: string[];
  token?: string;
};

export const BaedalOptionsSchema = z
  .object({
    conflictMode: z
      .object({
        mode: z.enum(["force", "skip-existing", "no-clobber", "interactive"]),
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
