import { jest } from "@jest/globals";
import { revokeOAuth } from "../../src/oauth/tokens.mjs";

test("OAuth revocation uses its endpoint and returns the provider result", async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce({ ok: true })
    .mockResolvedValueOnce({ ok: false });
  await expect(revokeOAuth({ token: "refresh", fetchImpl })).resolves.toBe(true);
  await expect(revokeOAuth({ accessToken: "access", fetchImpl })).resolves.toBe(false);
  expect(fetchImpl).toHaveBeenNthCalledWith(
    1,
    "https://dash.cloudflare.com/oauth2/revoke",
    expect.objectContaining({ method: "POST" }),
  );
  expect(fetchImpl.mock.calls[0][1].body.get("token")).toBe("refresh");
  expect(fetchImpl.mock.calls[1][1].body.get("token")).toBe("access");
  expect(fetchImpl.mock.calls[0][1].body.get("client_id")).toBe("f4fb39624f6674b6fb50d5a793a23389");
});

test("OAuth revocation uses the default fetch implementation", async () => {
  const originalFetch = globalThis.fetch;
  const fetchImpl = jest.fn().mockResolvedValue({ ok: true });
  globalThis.fetch = fetchImpl;
  try {
    await revokeOAuth({ accessToken: "access" });
  } finally {
    globalThis.fetch = originalFetch;
  }
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});
