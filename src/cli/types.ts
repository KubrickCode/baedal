import { z } from "zod";

export type PullCLIOptions = {
  clobber?: boolean;
  exclude?: string[];
  force?: boolean;
  noClobber?: boolean;
  skipExisting?: boolean;
  token?: string;
};

export const PullCLIOptionsSchema = z
  .object({
    clobber: z.boolean().optional(),
    exclude: z
      .array(
        z.string().refine((val) => val.trim().length > 0, {
          message: "Exclude patterns cannot be empty strings",
        })
      )
      .optional(),
    force: z.boolean().optional(),
    noClobber: z.boolean().optional(),
    skipExisting: z.boolean().optional(),
    token: z.string().min(1).optional(),
  })
  .strict()
  .refine(
    (data) => {
      const conflictFlags = [data.force, data.skipExisting, data.noClobber].filter(Boolean);
      return conflictFlags.length <= 1;
    },
    {
      message: `Cannot use --force, --skip-existing, and --no-clobber together.
Choose one conflict resolution mode:
  --force           Overwrite without asking
  --skip-existing   Keep existing files
  --no-clobber      Abort if conflicts exist`,
    }
  );
