import { BaseError, ConfigError, ValidationError } from ".";

describe("ValidationError", () => {
  it("should create ValidationError with message only", () => {
    const error = new ValidationError("Invalid input");

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toBeInstanceOf(BaseError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Invalid input");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.name).toBe("ValidationError");
    expect(error.field).toBeUndefined();
    expect(error.value).toBeUndefined();
  });

  it("should create ValidationError with field and value", () => {
    const error = new ValidationError("Source must be a non-empty string", "source", "");

    expect(error.message).toBe("Source must be a non-empty string");
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.field).toBe("source");
    expect(error.value).toBe("");
  });

  it("should handle complex value types", () => {
    const complexValue = { force: true, skipExisting: true };
    const error = new ValidationError("Conflicting options", "options", complexValue);

    expect(error.field).toBe("options");
    expect(error.value).toEqual(complexValue);
  });

  it("should preserve stack trace", () => {
    const error = new ValidationError("Test error");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("ValidationError");
  });
});

describe("ConfigError", () => {
  it("should create ConfigError with message only", () => {
    const error = new ConfigError("Missing required configuration");

    expect(error).toBeInstanceOf(ConfigError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toBeInstanceOf(BaseError);
    expect(error.message).toBe("Missing required configuration");
    expect(error.code).toBe("CONFIG_ERROR");
    expect(error.name).toBe("ConfigError");
    expect(error.field).toBeUndefined();
    expect(error.value).toBeUndefined();
  });

  it("should create ConfigError with field and value", () => {
    const error = new ConfigError("Invalid repository format", "repository", "invalid/repo/path");

    expect(error.message).toBe("Invalid repository format");
    expect(error.code).toBe("CONFIG_ERROR");
    expect(error.field).toBe("repository");
    expect(error.value).toBe("invalid/repo/path");
  });

  it("should inherit ValidationError properties", () => {
    const error = new ConfigError("Token is required for private repositories", "token", undefined);

    expect(error.field).toBe("token");
    expect(error.value).toBeUndefined();
  });

  it("should handle null values", () => {
    const error = new ConfigError("Output path cannot be null", "outputPath", null);

    expect(error.field).toBe("outputPath");
    expect(error.value).toBeNull();
  });
});
