import type { BaedalOptions, ConflictMode } from "./types";
import { BaedalOptionsSchema } from "./types";

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

describe("BaedalOptionsSchema", () => {
  describe("valid options", () => {
    it("should accept empty options object", () => {
      const result = BaedalOptionsSchema.parse({});

      expect(result).toEqual({});
    });

    it("should accept valid conflictMode", () => {
      const options = { conflictMode: { mode: "force" as const } };
      const result = BaedalOptionsSchema.parse(options);

      expect(result).toEqual(options);
    });

    it("should accept all conflictMode variants", () => {
      expect(() => BaedalOptionsSchema.parse({ conflictMode: { mode: "force" } })).not.toThrow();
      expect(() =>
        BaedalOptionsSchema.parse({ conflictMode: { mode: "skip-existing" } })
      ).not.toThrow();
      expect(() =>
        BaedalOptionsSchema.parse({ conflictMode: { mode: "no-clobber" } })
      ).not.toThrow();
      expect(() =>
        BaedalOptionsSchema.parse({ conflictMode: { mode: "interactive" } })
      ).not.toThrow();
    });

    it("should accept valid exclude patterns", () => {
      const options = { exclude: ["*.log", "node_modules/", "temp/**"] };
      const result = BaedalOptionsSchema.parse(options);

      expect(result).toEqual(options);
    });

    it("should accept valid token", () => {
      const options = { token: "ghp_token123" };
      const result = BaedalOptionsSchema.parse(options);

      expect(result).toEqual(options);
    });

    it("should accept all valid options together", () => {
      const options = {
        conflictMode: { mode: "force" as const },
        exclude: ["*.log"],
        token: "ghp_token",
      };
      const result = BaedalOptionsSchema.parse(options);

      expect(result).toEqual(options);
    });
  });

  describe("invalid options", () => {
    it("should reject invalid conflictMode value", () => {
      const options = { conflictMode: { mode: "invalid" } };
      const result = BaedalOptionsSchema.safeParse(options);

      expect(result.success).toBe(false);
    });

    it("should reject empty string in exclude patterns", () => {
      const options = { exclude: [""] };
      const result = BaedalOptionsSchema.safeParse(options);

      expect(result.success).toBe(false);
    });

    it("should reject empty token", () => {
      const options = { token: "" };
      const result = BaedalOptionsSchema.safeParse(options);

      expect(result.success).toBe(false);
    });

    it("should reject unknown properties due to strict mode", () => {
      const options = { unknownProp: "value" };
      const result = BaedalOptionsSchema.safeParse(options);

      expect(result.success).toBe(false);
    });

    it("should reject non-array exclude", () => {
      const options = { exclude: "*.log" };
      const result = BaedalOptionsSchema.safeParse(options);

      expect(result.success).toBe(false);
    });

    it("should reject non-string token", () => {
      const options = { token: 123 };
      const result = BaedalOptionsSchema.safeParse(options);

      expect(result.success).toBe(false);
    });
  });
});
