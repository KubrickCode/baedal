import { ValidationError } from "../internal/core/errors/";
import { adaptCLIOptions } from "./adapter";
import type { PullCLIOptions } from "./types";

describe("adaptCLIOptions", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("ConflictMode conversion", () => {
    it("should convert force flag to force mode", () => {
      const cliOptions: PullCLIOptions = { force: true };
      const result = adaptCLIOptions(cliOptions);

      expect(result.conflictMode).toEqual({ mode: "force" });
    });

    it("should convert skipExisting flag to skip-existing mode", () => {
      const cliOptions: PullCLIOptions = { skipExisting: true };
      const result = adaptCLIOptions(cliOptions);

      expect(result.conflictMode).toEqual({ mode: "skip-existing" });
    });

    it("should convert noClobber flag to no-clobber mode", () => {
      const cliOptions: PullCLIOptions = { noClobber: true };
      const result = adaptCLIOptions(cliOptions);

      expect(result.conflictMode).toEqual({ mode: "no-clobber" });
    });

    it("should convert clobber=false to no-clobber mode", () => {
      const cliOptions: PullCLIOptions = { clobber: false };
      const result = adaptCLIOptions(cliOptions);

      expect(result.conflictMode).toEqual({ mode: "no-clobber" });
    });

    it("should convert modifiedOnly flag to modified-only mode", () => {
      const cliOptions: PullCLIOptions = { modifiedOnly: true };
      const result = adaptCLIOptions(cliOptions);

      expect(result.conflictMode).toEqual({ mode: "modified-only" });
    });

    it("should return undefined conflictMode when no flags are set", () => {
      const cliOptions: PullCLIOptions = {};
      const result = adaptCLIOptions(cliOptions);

      expect(result.conflictMode).toBeUndefined();
    });
  });

  describe("Conflict flag validation", () => {
    it("should throw error when force and skipExisting are both set", () => {
      const cliOptions: PullCLIOptions = {
        force: true,
        skipExisting: true,
      };

      expect(() => adaptCLIOptions(cliOptions)).toThrow(
        "Cannot use --force, --modified-only, --no-clobber, and --skip-existing together"
      );
    });

    it("should throw ValidationError for conflicting flags", () => {
      const cliOptions: PullCLIOptions = {
        force: true,
        skipExisting: true,
      };

      expect(() => adaptCLIOptions(cliOptions)).toThrow(ValidationError);
    });

    it("should throw error when force and noClobber are both set", () => {
      const cliOptions: PullCLIOptions = {
        force: true,
        noClobber: true,
      };

      expect(() => adaptCLIOptions(cliOptions)).toThrow(
        "Cannot use --force, --modified-only, --no-clobber, and --skip-existing together"
      );
    });

    it("should throw error when skipExisting and noClobber are both set", () => {
      const cliOptions: PullCLIOptions = {
        noClobber: true,
        skipExisting: true,
      };

      expect(() => adaptCLIOptions(cliOptions)).toThrow(
        "Cannot use --force, --modified-only, --no-clobber, and --skip-existing together"
      );
    });

    it("should throw error when all flags are set", () => {
      const cliOptions: PullCLIOptions = {
        force: true,
        modifiedOnly: true,
        noClobber: true,
        skipExisting: true,
      };

      expect(() => adaptCLIOptions(cliOptions)).toThrow(
        "Cannot use --force, --modified-only, --no-clobber, and --skip-existing together"
      );
    });

    it("should include flag descriptions in error message", () => {
      const cliOptions: PullCLIOptions = {
        force: true,
        skipExisting: true,
      };

      try {
        adaptCLIOptions(cliOptions);
        expect.fail("Expected adaptCLIOptions to throw an error.");
      } catch (e) {
        if (!(e instanceof Error)) {
          expect.fail("Expected an Error to be thrown");
        }
        expect(e.message).toMatch(/Choose one conflict resolution mode/);
        expect(e.message).toMatch(/--force.*Overwrite without asking/);
        expect(e.message).toMatch(/--skip-existing.*Keep existing files/);
        expect(e.message).toMatch(/--no-clobber.*Abort if conflicts exist/);
      }
    });
  });

  describe("Token resolution", () => {
    it("should use CLI token when provided", () => {
      const cliOptions: PullCLIOptions = { token: "cli-token" };
      const result = adaptCLIOptions(cliOptions);

      expect(result.token).toBe("cli-token");
    });

    it("should use GITHUB_TOKEN when CLI token is not provided", () => {
      process.env.GITHUB_TOKEN = "github-token";
      const cliOptions: PullCLIOptions = {};
      const result = adaptCLIOptions(cliOptions);

      expect(result.token).toBe("github-token");
    });

    it("should use BAEDAL_TOKEN when neither CLI token nor GITHUB_TOKEN is provided", () => {
      process.env.BAEDAL_TOKEN = "baedal-token";
      const cliOptions: PullCLIOptions = {};
      const result = adaptCLIOptions(cliOptions);

      expect(result.token).toBe("baedal-token");
    });

    it("should prioritize CLI token over environment variables", () => {
      process.env.GITHUB_TOKEN = "github-token";
      process.env.BAEDAL_TOKEN = "baedal-token";
      const cliOptions: PullCLIOptions = { token: "cli-token" };
      const result = adaptCLIOptions(cliOptions);

      expect(result.token).toBe("cli-token");
    });

    it("should prioritize GITHUB_TOKEN over BAEDAL_TOKEN", () => {
      process.env.GITHUB_TOKEN = "github-token";
      process.env.BAEDAL_TOKEN = "baedal-token";
      const cliOptions: PullCLIOptions = {};
      const result = adaptCLIOptions(cliOptions);

      expect(result.token).toBe("github-token");
    });

    it("should return undefined token when none are provided", () => {
      const cliOptions: PullCLIOptions = {};
      const result = adaptCLIOptions(cliOptions);

      expect(result.token).toBeUndefined();
    });
  });

  describe("Exclude patterns", () => {
    it("should include exclude patterns when provided", () => {
      const cliOptions: PullCLIOptions = {
        exclude: ["*.test.ts", "*.spec.ts"],
      };
      const result = adaptCLIOptions(cliOptions);

      expect(result.exclude).toEqual(["*.test.ts", "*.spec.ts"]);
    });

    it("should not include exclude field when not provided", () => {
      const cliOptions: PullCLIOptions = {};
      const result = adaptCLIOptions(cliOptions);

      expect(result.exclude).toBeUndefined();
    });

    it("should throw ValidationError when exclude patterns contain empty strings", () => {
      const cliOptions: PullCLIOptions = {
        exclude: ["*.test.ts", "", "*.spec.ts"],
      };

      expect(() => adaptCLIOptions(cliOptions)).toThrow("Exclude patterns cannot be empty strings");
    });

    it("should throw ValidationError when exclude patterns contain only whitespace", () => {
      const cliOptions: PullCLIOptions = {
        exclude: ["*.test.ts", "   ", "*.spec.ts"],
      };

      expect(() => adaptCLIOptions(cliOptions)).toThrow("Exclude patterns cannot be empty strings");
    });

    it("should pass validation when all exclude patterns are valid", () => {
      const cliOptions: PullCLIOptions = {
        exclude: ["*.test.ts", "*.spec.ts", "node_modules/**"],
      };

      expect(() => adaptCLIOptions(cliOptions)).not.toThrow();
    });

    it("should pass validation when exclude patterns is not provided", () => {
      const cliOptions: PullCLIOptions = {};

      expect(() => adaptCLIOptions(cliOptions)).not.toThrow();
      expect(adaptCLIOptions(cliOptions).exclude).toBeUndefined();
    });
  });

  describe("Complete options", () => {
    it("should convert all options correctly", () => {
      process.env.GITHUB_TOKEN = "env-token";
      const cliOptions: PullCLIOptions = {
        exclude: ["*.log"],
        force: true,
        token: "cli-token",
      };
      const result = adaptCLIOptions(cliOptions);

      expect(result).toEqual({
        conflictMode: { mode: "force" },
        exclude: ["*.log"],
        token: "cli-token",
      });
    });

    it("should only include defined values", () => {
      const cliOptions: PullCLIOptions = {};
      const result = adaptCLIOptions(cliOptions);

      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe("Zod validation", () => {
    it("should reject unknown properties", () => {
      const cliOptions = {
        force: true,
        unknownProp: "value",
      } as any;

      expect(() => adaptCLIOptions(cliOptions)).toThrow(ValidationError);
      expect(() => adaptCLIOptions(cliOptions)).toThrow(/Invalid CLI options/);
    });

    it("should reject non-boolean force", () => {
      const cliOptions = {
        force: "true",
      } as any;

      expect(() => adaptCLIOptions(cliOptions)).toThrow(ValidationError);
    });

    it("should reject non-array exclude", () => {
      const cliOptions = {
        exclude: "*.log",
      } as any;

      expect(() => adaptCLIOptions(cliOptions)).toThrow(ValidationError);
    });

    it("should reject non-string token", () => {
      const cliOptions = {
        token: 123,
      } as any;

      expect(() => adaptCLIOptions(cliOptions)).toThrow(ValidationError);
    });

    it("should accept all valid CLI options", () => {
      const cliOptions: PullCLIOptions = {
        exclude: ["*.log"],
        force: true,
        noClobber: false,
        skipExisting: false,
        token: "ghp_token",
      };

      expect(() => adaptCLIOptions(cliOptions)).not.toThrow();
    });
  });
});
