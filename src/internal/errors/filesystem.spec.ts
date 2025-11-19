import { BaseError, ExtractionError, FileSystemError } from ".";

describe("FileSystemError", () => {
  it("should create an error with message and path", () => {
    const error = new FileSystemError("File not found", "/path/to/file");

    expect(error.message).toBe("File not found");
    expect(error.path).toBe("/path/to/file");
    expect(error.code).toBe("FILESYSTEM_ERROR");
    expect(error.name).toBe("FileSystemError");
  });

  it("should create an error without path", () => {
    const error = new FileSystemError("File operation failed");

    expect(error.message).toBe("File operation failed");
    expect(error.path).toBeUndefined();
    expect(error.code).toBe("FILESYSTEM_ERROR");
  });

  it("should be an instance of BaseError", () => {
    const error = new FileSystemError("Test error");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseError);
    expect(error).toBeInstanceOf(FileSystemError);
  });

  it("should capture stack trace", () => {
    const error = new FileSystemError("Test error", "/path");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("FileSystemError");
  });
});

describe("ExtractionError", () => {
  it("should create an error with message, path, and cause", () => {
    const cause = new Error("Original error");
    const error = new ExtractionError("Extraction failed", "/path/to/archive", cause);

    expect(error.message).toBe("Extraction failed");
    expect(error.path).toBe("/path/to/archive");
    expect(error.cause).toBe(cause);
    expect(error.code).toBe("EXTRACTION_ERROR");
    expect(error.name).toBe("ExtractionError");
  });

  it("should create an error without path and cause", () => {
    const error = new ExtractionError("Extraction failed");

    expect(error.message).toBe("Extraction failed");
    expect(error.path).toBeUndefined();
    expect(error.cause).toBeUndefined();
    expect(error.code).toBe("EXTRACTION_ERROR");
  });

  it("should be an instance of FileSystemError and BaseError", () => {
    const error = new ExtractionError("Test error");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseError);
    expect(error).toBeInstanceOf(FileSystemError);
    expect(error).toBeInstanceOf(ExtractionError);
  });

  it("should preserve cause error information", () => {
    const originalError = new Error("Tarball corrupted");
    originalError.stack = "Original stack trace";
    const error = new ExtractionError(
      "Failed to extract tarball",
      "/tmp/archive.tar.gz",
      originalError
    );

    expect(error.cause).toBe(originalError);
    expect(error.cause?.message).toBe("Tarball corrupted");
    expect(error.cause?.stack).toBe("Original stack trace");
  });

  it("should capture stack trace", () => {
    const error = new ExtractionError("Test error");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("ExtractionError");
  });

  it("should handle nested error chains", () => {
    const rootCause = new Error("Root cause");
    const intermediateCause = new ExtractionError("Intermediate error", "/path1", rootCause);
    const finalError = new ExtractionError("Final error", "/path2", intermediateCause);

    expect(finalError.cause).toBe(intermediateCause);
    expect((finalError.cause as ExtractionError).cause).toBe(rootCause);
  });
});
