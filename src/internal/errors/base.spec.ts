import { BaseError } from "./base.js";

describe("BaseError", () => {
  it("should create an error with message and code", () => {
    const error = new BaseError("Test error", "TEST_ERROR");

    expect(error.message).toBe("Test error");
    expect(error.code).toBe("TEST_ERROR");
    expect(error.name).toBe("BaseError");
  });

  it("should be an instance of Error", () => {
    const error = new BaseError("Test error", "TEST_ERROR");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BaseError);
  });

  it("should capture stack trace", () => {
    const error = new BaseError("Test error", "TEST_ERROR");

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("BaseError");
  });

  it("should preserve error name in inheritance", () => {
    class CustomError extends BaseError {
      constructor(message: string) {
        super(message, "CUSTOM_ERROR");
      }
    }

    const error = new CustomError("Custom error");

    expect(error.name).toBe("CustomError");
    expect(error.code).toBe("CUSTOM_ERROR");
    expect(error).toBeInstanceOf(BaseError);
  });

  it("should handle empty message", () => {
    const error = new BaseError("", "EMPTY_MESSAGE");

    expect(error.message).toBe("");
    expect(error.code).toBe("EMPTY_MESSAGE");
  });
});
