import { API_BASE_URL } from '../config/env';

/** Never reached the server - offline, DNS failure, or timed out. Safe to retry. */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/** The server answered, with a failure status. Retry only if 5xx. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

type RequestOptions = RequestInit & { timeoutMs?: number };

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...init } = options;

  // fetch has no timeout of its own, Without this, a request to an unreachable
  // host hangs forever - unacceptable for an app built around bad gym signal.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // Caller's headers will override these if provided
        ...headers,
      },
    });

    if (!response.ok) {
      // A 500 may return HTML rather than JSON, so parsing is best-effort.
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        // leave body as null
      }

      const message =
        typeof body === 'object' && body !== null && 'message' in body
          ? String((body as { message: unknown }).message)
          : `Request failed with status ${response.status}`;

      throw new ApiError(message, response.status, body);
    }

    // 204 No Content has no body to parse.
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    // The ApiError thrown above passes through this catch. Without this line it
    // would be relabelled as a network failure, and the sync layer would retry
    // a 422 forever instead of giving up on it.
    if (error instanceof ApiError) {
      throw error;
    }

    const timeOut = error instanceof Error && error.name === 'AbortError';
    throw new NetworkError(
      timeOut
        ? `Request timed out after ${timeoutMs}ms`
        : `Network request failed`,
    );
  } finally {
    // Cleared on success too, so a finished request can never abort itself later.
    clearTimeout(timer);
  }
}

export const get = <T>(path: string, options?: RequestOptions): Promise<T> =>
  request<T>(path, { ...options, method: 'GET' });

export const post = <T>(
  path: string,
  body: unknown,
  options?: RequestOptions,
): Promise<T> =>
  request<T>(path, { ...options, body: JSON.stringify(body), method: 'POST' });
