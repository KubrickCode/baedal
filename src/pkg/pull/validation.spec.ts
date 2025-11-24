import { ValidationError } from "../../internal/core/errors/";
import { validateBaedalOptions } from "./validation";

describe("validateBaedalOptions", () => {
  describe("source validation", () => {
    it.each([
      ["", "empty source"],
      ["   ", "whitespace-only source"],
    ])("should throw ValidationError for %s", (source) => {
      expect(() => validateBaedalOptions(source, ".", undefined)).toThrow(ValidationError);
      expect(() => validateBaedalOptions(source, ".", undefined)).toThrow(/Source cannot be empty/);
    });

    it("should include actionable hints in source error message", () => {
      const expectedMessagePattern =
        /Try: user\/repo[\s\S]*github:user\/repo[\s\S]*https:\/\/github.com\/user\/repo/;
      expect(() => validateBaedalOptions("", ".", undefined)).toThrow(expectedMessagePattern);
    });
  });

  describe("destination validation", () => {
    it.each([
      ["", "empty destination"],
      ["   ", "whitespace-only destination"],
    ])("should throw ValidationError for %s", (destination) => {
      expect(() => validateBaedalOptions("user/repo", destination, undefined)).toThrow(
        ValidationError
      );
      expect(() => validateBaedalOptions("user/repo", destination, undefined)).toThrow(
        /Destination cannot be empty/
      );
    });

    it("should include actionable hints in destination error message", () => {
      expect(() => validateBaedalOptions("user/repo", "", undefined)).toThrow(
        /Try: \. or \.\/my-folder/
      );
    });
  });

  describe("exclude patterns validation", () => {
    it.each([
      [[""], "empty exclude patterns"],
      [["   "], "whitespace-only exclude patterns"],
      [["valid", "", "also-valid"], "mixed valid and empty patterns"],
    ])("should throw ValidationError for %s", (exclude) => {
      expect(() => validateBaedalOptions("user/repo", ".", { exclude })).toThrow(ValidationError);
      expect(() => validateBaedalOptions("user/repo", ".", { exclude })).toThrow(
        /Exclude patterns cannot be empty strings/
      );
    });

    it("should include actionable hints in exclude patterns error message", () => {
      expect(() => validateBaedalOptions("user/repo", ".", { exclude: [""] })).toThrow(
        /Try: \['\*\.log', 'temp\/', 'node_modules\/'\]/
      );
    });
  });

  describe("valid inputs", () => {
    it("should not throw for valid inputs", () => {
      expect(() => validateBaedalOptions("user/repo", ".", undefined)).not.toThrow();
      expect(() => validateBaedalOptions("user/repo", "./dest", undefined)).not.toThrow();
      expect(() =>
        validateBaedalOptions("user/repo", ".", { exclude: ["*.log", "temp/"] })
      ).not.toThrow();
    });
  });
});
