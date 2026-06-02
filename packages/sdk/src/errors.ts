/**
 * Mirrors the backend error envelope produced by AllExceptionsFilter:
 * { statusCode, code, message, details?, requestId?, ... }
 */
export interface ApiErrorBody {
  statusCode?: number;
  code?: string;
  message?: string;
  details?: unknown;
  requestId?: string;
}

/** Normalized error thrown by the SDK for any non-success response. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }

  static fromResponse(status: number, body: unknown): ApiError {
    const envelope = (body ?? {}) as ApiErrorBody;
    return new ApiError(
      status,
      envelope.code ?? 'UNKNOWN_ERROR',
      envelope.message ?? `Request failed with status ${status}`,
      envelope.details,
      envelope.requestId,
    );
  }
}
