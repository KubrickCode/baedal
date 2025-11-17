import { CustomError } from "ts-custom-error";

export class BaseError extends CustomError {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
  }
}
