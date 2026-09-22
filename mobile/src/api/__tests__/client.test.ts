import { ApiError, get, NetworkError } from '../client';

const realFetch = globalThis.fetch;

function mockResponse(status: number, body: unknown) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  jest.restoreAllMocks();
});

describe('api client', () => {
  it('resolves with parsed body on 200', async () => {
    mockResponse(200, { status: 'ok' });

    await expect(get<{ status: string }>('/health')).resolves.toEqual({
      status: 'ok',
    });
  });

  it('treats 201 as success, not failure', async () => {
    // POST /exercises answers 201 on create and 200 on an idempotent replay.
    // Both mean success, so the client must not special-case 200.
    mockResponse(201, { id: 1, name: 'Front Squat' });

    await expect(get('/exercises')).resolves.toMatchObject({ id: 1 });
  });

  it('throws ApiError carrying the status when the server rejects', async () => {
    mockResponse(422, { message: 'The uuid field must be a valid UUID.' });

    const error = await get('/exercises').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(422);
    expect((error as ApiError).message).toBe(
      'The uuid field must be a valid UUID.',
    );
  });

  it('throws NetworkError when the request never reaches the server', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(
        new TypeError('Network request failed'),
      ) as unknown as typeof fetch;

    await expect(get('/health')).rejects.toBeInstanceOf(NetworkError);
  });

  it('throws NetworkError when the request times out', async () => {
    // Never resolves; only the AbortController's signal ends it.
    globalThis.fetch = jest.fn(
      (_input: unknown, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    ) as unknown as typeof fetch;

    await expect(get('/health', { timeoutMs: 10 })).rejects.toBeInstanceOf(
      NetworkError,
    );
  });
});
