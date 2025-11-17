import { BaseError } from "./base.js";

export class FileSystemError extends BaseError {
  constructor(
    message: string,
    public readonly path?: string
  ) {
    super(message, "FILESYSTEM_ERROR");
  }
}

export class ExtractionError extends FileSystemError {
  override readonly code = "EXTRACTION_ERROR";

  constructor(
    message: string,
    path?: string,
    public override readonly cause?: Error
  ) {
    super(message, path);
  }
}
