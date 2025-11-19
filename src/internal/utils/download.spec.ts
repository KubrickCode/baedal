import { NetworkError } from "../errors";

describe("download - Error Validation", () => {
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
});
