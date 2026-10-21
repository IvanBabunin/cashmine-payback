export type ApiErrorCode =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'IDEMPOTENCY_MISMATCH'
  | 'RATE_LIMITED'
  | 'SERVER'
  | 'TIMEOUT'
  | 'NETWORK';

type ErrorBody = {
  error?: { code?: string; message?: string; field?: string; retryAfterMs?: number };
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly field?: string,
    public readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * True when the server may or may not have applied a write: no response, 5xx or 504.
   * 4xx (including 429) are rejected before anything is applied.
   */
  get isOutcomeUnknown() {
    return this.status === 0 || this.status >= 500;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: ErrorBody | undefined;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const e = body?.error;
    const headerSeconds = Number(res.headers.get('Retry-After'));
    const retryAfterMs =
      e?.retryAfterMs ??
      (Number.isFinite(headerSeconds) && headerSeconds > 0 ? headerSeconds * 1000 : undefined);
    const code =
      (e?.code as ApiErrorCode | undefined) ?? (res.status >= 500 ? 'SERVER' : 'VALIDATION');
    return new ApiError(
      res.status,
      code,
      e?.message ?? res.statusText ?? 'Request failed',
      e?.field,
      retryAfterMs,
    );
  }

  static network(timedOut: boolean): ApiError {
    return new ApiError(
      0,
      timedOut ? 'TIMEOUT' : 'NETWORK',
      timedOut ? 'Request timed out' : 'Network error',
    );
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/** Translation key for a user-facing message about a failed read. */
export function errorMessageKey(error: unknown) {
  if (!isApiError(error)) return 'common:errors.generic' as const;
  if (error.code === 'NETWORK' || error.code === 'TIMEOUT') return 'common:errors.network' as const;
  if (error.code === 'RATE_LIMITED') return 'common:errors.rateLimited' as const;
  if (error.code === 'NOT_FOUND') return 'common:errors.notFound' as const;
  if (error.status >= 500) return 'common:errors.server' as const;
  return 'common:errors.generic' as const;
}
