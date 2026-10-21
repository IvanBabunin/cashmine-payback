import { http, setAuthToken, setUnauthorizedHandler } from './client';

const json = (status: number, body: unknown) =>
  ({
    ok: status < 400,
    status,
    statusText: '',
    headers: new Headers(),
    json: async () => body,
  }) as Response;

describe('401 handling', () => {
  const logout = jest.fn();

  beforeEach(() => {
    logout.mockReset();
    setAuthToken('token-a');
    setUnauthorizedHandler(logout);
  });

  it('keeps the user signed in when a single 401 is followed by success', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } }))
      .mockResolvedValueOnce(json(200, { ok: true }));

    await expect(http.get('/v1/balances')).resolves.toEqual({ ok: true });
    expect(logout).not.toHaveBeenCalled();
  });

  it('logs out when the retry is rejected too', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } }));

    await expect(http.get('/v1/balances')).rejects.toMatchObject({ status: 401 });
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('ignores a 401 for a token that was replaced while the request was in flight', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } }))
      .mockImplementationOnce(async () => {
        setAuthToken('token-b');
        return json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } });
      });

    await expect(http.get('/v1/balances')).rejects.toMatchObject({ status: 401 });
    expect(logout).not.toHaveBeenCalled();
  });
});
