import { jest } from "@jest/globals";
import { loadOAuthAccountIdentity } from "../../../src/oauth/account/identity.mjs";

test("loads the account identity with the OAuth access token", async () => {
  const fetchImpl = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ result: { name: "Acme" } }),
  });
  await expect(loadOAuthAccountIdentity({ accessToken: "access", fetchImpl })).resolves.toEqual({
    name: "Acme",
  });
  expect(fetchImpl).toHaveBeenCalledWith("https://api.cloudflare.com/client/v4/user", {
    headers: { authorization: "Bearer access" },
  });
});

test("returns no identity when the account request fails", async () => {
  await expect(
    loadOAuthAccountIdentity({ fetchImpl: jest.fn().mockResolvedValue({ ok: false }) }),
  ).resolves.toBeNull();
  await expect(
    loadOAuthAccountIdentity({ fetchImpl: jest.fn().mockRejectedValue(Error("offline")) }),
  ).resolves.toBeNull();
  await expect(
    loadOAuthAccountIdentity({
      fetchImpl: jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    }),
  ).resolves.toBeNull();
});
