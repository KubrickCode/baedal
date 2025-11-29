import { NetworkError } from "../core/errors/index";

describe("download - Error Validation", () => {
  describe("NetworkError", () => {
    it("should verify NetworkError is thrown with URL context", () => {
      const url = "https://api.github.com/repos/owner/repo/tarball";
      const error = new NetworkError("Response body is empty", undefined, url);

      expect(error).toBeInstanceOf(NetworkError);
      expect(error.message).toBe("Response body is empty");
      expect(error.url).toBe(url);
      expect(error.code).toBe("NETWORK_ERROR");
    });

    it("should verify NetworkError includes proper error structure", () => {
      const error = new NetworkError(
        "Failed to download from GitHub: Response body is empty",
        undefined,
        "https://api.github.com/test"
      );

      expect(error.url).toBeDefined();
      expect(error.message).toContain("Response body is empty");
    });

    it("should have correct name property", () => {
      const error = new NetworkError("Test error");

      expect(error.name).toBe("NetworkError");
    });

    it("should be instanceof Error", () => {
      const error = new NetworkError("Test error");

      expect(error).toBeInstanceOf(Error);
    });

    it("should handle optional statusCode parameter", () => {
      const error = new NetworkError("Not Found", 404, "https://api.github.com/test");

      expect(error.statusCode).toBe(404);
    });

    it("should handle undefined statusCode", () => {
      const error = new NetworkError("Error", undefined, "https://api.github.com/test");

      expect(error.statusCode).toBeUndefined();
    });

    it("should handle undefined url", () => {
      const error = new NetworkError("Error");

      expect(error.url).toBeUndefined();
    });
  });
});
