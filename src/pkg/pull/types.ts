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
