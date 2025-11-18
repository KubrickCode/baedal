import { ConfigError } from "../../internal/errors/index.js";
import { executePush } from "./executor.js";
import type { PushConfig } from "./types.js";

describe("executePush", () => {
  describe("Error Handling", () => {
    it("should throw ConfigError when token is missing", async () => {
      const config = {
        syncs: [
          {
            dest: "/dest",
            repos: ["owner/repo"],
            source: "/source",
          },
        ],
        token: "",
      } as PushConfig;

      await expect(executePush(config, "test-sync")).rejects.toThrow(ConfigError);
      await expect(executePush(config, "test-sync")).rejects.toThrow("GitHub token is required");
    });

    it("should throw ConfigError with correct properties", async () => {
      const config = {
        syncs: [],
        token: "",
      } as PushConfig;

      try {
        await executePush(config, "test-sync");
        fail("Should have thrown ConfigError");
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigError);
        if (error instanceof ConfigError) {
          expect(error.code).toBe("CONFIG_ERROR");
          expect(error.field).toBe("token");
          expect(error.value).toBeUndefined();
          expect(error.message).toContain("GitHub token is required");
        }
      }
    });

    it("should throw ConfigError when token is whitespace only", async () => {
      const config = {
        syncs: [],
        token: "   ",
      } as PushConfig;

      await expect(executePush(config, "test-sync")).rejects.toThrow(ConfigError);
    });
  });

  describe("Error Classes", () => {
    it("ConfigError should extend Error", () => {
      const error = new ConfigError("Test message", "testField", "testValue");
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test message");
    });

    it("ConfigError should have correct code property", () => {
      const error = new ConfigError("Test", "field", "value");
      expect(error.code).toBe("CONFIG_ERROR");
    });

    it("ConfigError should capture field and value", () => {
      const error = new ConfigError("Test", "myField", 123);
      expect(error.field).toBe("myField");
      expect(error.value).toBe(123);
    });
  });
});
