import { z } from "zod";
import { NetworkError, ValidationError } from "../core/errors/index.js";
import { parseWithZod } from "./zod-helpers.js";

describe("parseWithZod", () => {
  const testSchema = z.object({
    age: z.number(),
    name: z.string(),
  });

  describe("successful parsing", () => {
    it("should return parsed data for valid input", () => {
      const input = { age: 25, name: "John" };
      const result = parseWithZod(testSchema, input, "user");

      expect(result).toEqual({ age: 25, name: "John" });
    });

    it("should handle nested objects", () => {
      const nestedSchema = z.object({
        address: z.object({
          city: z.string(),
        }),
        name: z.string(),
      });

      const input = { address: { city: "Seoul" }, name: "John" };
      const result = parseWithZod(nestedSchema, input, "user");

      expect(result).toEqual({ address: { city: "Seoul" }, name: "John" });
    });

    it("should handle arrays", () => {
      const arraySchema = z.object({
        items: z.array(z.string()),
      });

      const input = { items: ["a", "b", "c"] };
      const result = parseWithZod(arraySchema, input, "list");

      expect(result).toEqual({ items: ["a", "b", "c"] });
    });
  });

  describe("validation error (default)", () => {
    it("should throw ValidationError for invalid data", () => {
      const input = { age: "not a number", name: "John" };

      expect(() => parseWithZod(testSchema, input, "user")).toThrow(ValidationError);
    });

    it("should include context in error message", () => {
      const input = { age: "not a number", name: "John" };

      expect(() => parseWithZod(testSchema, input, "user")).toThrow("Invalid user");
    });

    it("should include field path in error message", () => {
      const input = { age: "not a number", name: "John" };

      try {
        parseWithZod(testSchema, input, "user");
        expect.fail("Expected ValidationError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.message).toContain("age");
        }
      }
    });

    it("should handle multiple validation errors", () => {
      const input = { age: "not a number", name: 123 };

      try {
        parseWithZod(testSchema, input, "user");
        expect.fail("Expected ValidationError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.message).toContain("age");
          expect(error.message).toContain("name");
        }
      }
    });

    it("should handle missing required fields", () => {
      const input = { name: "John" };

      expect(() => parseWithZod(testSchema, input, "user")).toThrow(ValidationError);
    });
  });

  describe("network error type", () => {
    it("should throw NetworkError when errorType is network", () => {
      const input = { age: "not a number", name: "John" };

      expect(() => parseWithZod(testSchema, input, "API response", "network")).toThrow(
        NetworkError
      );
    });

    it("should include response context in network error message", () => {
      const input = { age: "not a number", name: "John" };

      expect(() => parseWithZod(testSchema, input, "GET /users", "network")).toThrow(
        "Invalid response"
      );
    });

    it("should include original context in network error message", () => {
      const input = { age: "not a number", name: "John" };

      try {
        parseWithZod(testSchema, input, "GET /users/123", "network");
        expect.fail("Expected NetworkError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkError);
        if (error instanceof NetworkError) {
          expect(error.message).toContain("GET /users/123");
        }
      }
    });
  });

  describe("non-ZodError handling", () => {
    it("should re-throw non-ZodErrors as-is", () => {
      const throwingSchema = {
        parse: () => {
          throw new ValidationError("Custom error");
        },
      };

      expect(() => parseWithZod(throwingSchema as unknown as z.ZodSchema, {}, "test")).toThrow(
        "Custom error"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty context string", () => {
      const input = { age: "not a number", name: "John" };

      expect(() => parseWithZod(testSchema, input, "")).toThrow(ValidationError);
    });

    it("should handle schema with optional fields", () => {
      const optionalSchema = z.object({
        name: z.string(),
        nickname: z.string().optional(),
      });

      const input = { name: "John" };
      const result = parseWithZod(optionalSchema, input, "user");

      expect(result).toEqual({ name: "John" });
    });

    it("should handle schema with default values", () => {
      const defaultSchema = z.object({
        name: z.string(),
        role: z.string().default("user"),
      });

      const input = { name: "John" };
      const result = parseWithZod(defaultSchema, input, "user");

      expect(result).toEqual({ name: "John", role: "user" });
    });

    it("should handle errors without path", () => {
      const stringSchema = z.string();
      const input = 123;

      try {
        parseWithZod(stringSchema, input, "value");
        expect.fail("Expected ValidationError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });
});
