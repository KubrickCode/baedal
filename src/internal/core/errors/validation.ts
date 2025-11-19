import { BaseError } from "./base";

export class ValidationError extends BaseError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message, "VALIDATION_ERROR");
  }
}

export class ConfigError extends ValidationError {
  public override readonly code = "CONFIG_ERROR";

  constructor(message: string, field?: string, value?: unknown) {
    super(message, field, value);
  }
}
