import { exchangeOAuthToken } from "../src/oauth-token-exchange.mjs";

test("exchanges an authorization code and returns tokens", async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ access_token: "a" }) });
  await expect(
    exchangeOAuthToken({ clientId: "c", code: "x", redirectUri: "u", verifier: "v", fetchImpl }),
  ).resolves.toEqual({ access_token: "a" });
  expect(fetchImpl.mock.calls[0][1].body).toContain("code_verifier=v");
});

test("rejects failed token responses and empty tokens", async () => {
  await expect(
    exchangeOAuthToken({ fetchImpl: jest.fn().mockResolvedValue({ ok: false }) }),
  ).rejects.toThrow("Token exchange failed");
  await expect(
    exchangeOAuthToken({
      fetchImpl: jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    }),
  ).rejects.toThrow("No access token");
});
