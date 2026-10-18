import { jest } from "@jest/globals";
import { refreshOAuth } from "../../src/oauth/refresh.mjs";

test("OAuth refresh parses tokens and keeps the old refresh token when needed", async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: "new", refresh_token: "next", expires_in: 120 }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "newer" }) });
  const refreshed = await refreshOAuth({ refreshToken: "old", clientId: "client", fetchImpl });
  expect(refreshed).toMatchObject({
    accessToken: "new",
    refreshToken: "next",
    expiresIn: 120,
  });
  expect(fetchImpl.mock.calls[0][1].body.get("grant_type")).toBe("refresh_token");
  const fallback = await refreshOAuth({ refreshToken: "old", fetchImpl });
  expect(fallback).toMatchObject({ refreshToken: "old", expiresIn: undefined });
  expect(fetchImpl.mock.calls[1][1].body.get("client_id")).toBe("f4fb39624f6674b6fb50d5a793a23389");
});

test("OAuth refresh uses the default fetch implementation", async () => {
  const originalFetch = globalThis.fetch;
  const fetchImpl = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ access_token: "access" }) });
  globalThis.fetch = fetchImpl;
  try {
    await refreshOAuth({ refreshToken: "refresh" });
  } finally {
    globalThis.fetch = originalFetch;
  }
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});

test("OAuth refresh reports failed and malformed responses", async () => {
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
});
