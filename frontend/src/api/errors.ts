interface ApiErrorOptions {
  statusCode: number;
  code: string;
  message: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public code: string;

  constructor({ statusCode, code, message }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
