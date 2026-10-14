import { jest } from "@jest/globals";
import { requestOAuthAccountData } from "../src/oauth-account-request.mjs";

test("requests account data with a bearer token and returns the result", async () => {
  const fetchImpl = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: [1] }) });
  await expect(
    requestOAuthAccountData({ url: "/zones", accessToken: "token", fetchImpl, errors: [] }),
  ).resolves.toEqual([1]);
  expect(fetchImpl).toHaveBeenCalledWith("https://api.cloudflare.com/client/v4/zones", {
    headers: { authorization: "Bearer token" },
  });
});

test("returns null for rejected responses or missing results", async () => {
  await expect(
    requestOAuthAccountData({
      url: "/zones",
      accessToken: "token",
      fetchImpl: jest.fn().mockResolvedValue({ ok: false }),
      errors: [],
    }),
  ).resolves.toBeNull();
  await expect(
    requestOAuthAccountData({
      url: "/zones",
      accessToken: "token",
      fetchImpl: jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
      errors: [],
    }),
  ).resolves.toBeNull();
});

test("records request errors and returns null", async () => {
  const errors = [];
  const result = await requestOAuthAccountData({
    url: "/zones",
    accessToken: "token",
    fetchImpl: jest.fn().mockRejectedValue(Error("offline")),
    errors,
  });
  expect(result).toBeNull();
  expect(errors).toEqual(["offline"]);
});
