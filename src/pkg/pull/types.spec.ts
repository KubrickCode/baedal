import type { BaedalOptions, ConflictMode } from "./types";

describe("ConflictMode", () => {
  test("should accept force mode", () => {
    const mode: ConflictMode = { mode: "force" };
    expect(mode.mode).toBe("force");
  });

  test("should accept skip-existing mode", () => {
    const mode: ConflictMode = { mode: "skip-existing" };
    expect(mode.mode).toBe("skip-existing");
  });

  test("should accept no-clobber mode", () => {
    const mode: ConflictMode = { mode: "no-clobber" };
    expect(mode.mode).toBe("no-clobber");
  });

  test("should accept interactive mode", () => {
    const mode: ConflictMode = { mode: "interactive" };
    expect(mode.mode).toBe("interactive");
  });
});

describe("BaedalOptions", () => {
  test("should accept conflictMode field", () => {
    const options: BaedalOptions = {
      conflictMode: { mode: "force" },
    };
    expect(options.conflictMode?.mode).toBe("force");
  });

  test("should accept all optional fields", () => {
    const options: BaedalOptions = {
      conflictMode: { mode: "skip-existing" },
      exclude: ["*.log"],
      token: "ghp_test123",
    };
    expect(options.conflictMode?.mode).toBe("skip-existing");
    expect(options.exclude).toEqual(["*.log"]);
    expect(options.token).toBe("ghp_test123");
  });

  test("should allow empty options object", () => {
    const options: BaedalOptions = {};
    expect(options).toEqual({});
  });
});
