import { BaseError } from "./base";

export class NetworkError extends BaseError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly url?: string
  ) {
    super(message, "NETWORK_ERROR");
  }
}

export class GitHubAPIError extends NetworkError {
  public override readonly code = "GITHUB_API_ERROR";

  constructor(
    message: string,
    statusCode?: number,
    url?: string,
    public readonly response?: unknown
  ) {
    super(message, statusCode, url);
  }
}
