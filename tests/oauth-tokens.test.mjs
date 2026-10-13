import { jest } from "@jest/globals";
import { refreshOAuth, revokeOAuth } from "../src/oauth-tokens.mjs";

test("OAuth refresh and revoke use Cloudflare token endpoints", async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "new",
        refresh_token: "next",
        expires_in: 120,
      }),
    })
    .mockResolvedValueOnce({ ok: true });
  const refreshed = await refreshOAuth({
    refreshToken: "old",
    clientId: "client",
    fetchImpl,
  });
  expect(refreshed.accessToken).toBe("new");
  await revokeOAuth({ accessToken: "new", clientId: "client", fetchImpl });
  expect(fetchImpl).toHaveBeenCalledTimes(2);
  expect(fetchImpl.mock.calls[0][1].body.get("grant_type")).toBe("refresh_token");
  const fallbackFetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ access_token: "newer" }),
  });
  const fallback = await refreshOAuth({
    refreshToken: "old",
    fetchImpl: fallbackFetch,
  });
  expect(fallback.refreshToken).toBe("old");
  expect(fallback.expiresIn).toBeUndefined();
  await revokeOAuth({
    accessToken: "new",
    fetchImpl: jest.fn().mockResolvedValue({ ok: true }),
  });
});

test("OAuth helpers use default clients and fetch implementation", async () => {
  const originalFetch = globalThis.fetch;
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "default-access" }),
    })
    .mockResolvedValueOnce({ ok: true });
  globalThis.fetch = fetchImpl;
  try {
    await refreshOAuth({ refreshToken: "refresh" });
    await revokeOAuth({ accessToken: "default-access" });
  } finally {
    globalThis.fetch = originalFetch;
  }
  expect(fetchImpl).toHaveBeenCalledTimes(2);
  expect(fetchImpl.mock.calls[0][1].body.get("client_id")).toBe("f4fb39624f6674b6fb50d5a793a23389");
});

test("OAuth token helpers report failed and malformed responses", async () => {
  await expect(
    refreshOAuth({
      refreshToken: "old",
      fetchImpl: jest.fn().mockResolvedValue({ ok: false, status: 401 }),
    }),
  ).rejects.toThrow("401");
  await expect(
    refreshOAuth({
      refreshToken: "old",
      fetchImpl: jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    }),
  ).rejects.toThrow("access_token");
  await expect(
    revokeOAuth({
      accessToken: "access",
      fetchImpl: jest.fn().mockResolvedValue({ ok: false }),
    }),
  ).resolves.toBe(false);
});
