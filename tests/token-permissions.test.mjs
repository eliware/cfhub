import { jest } from "@jest/globals";
import { inspectApiToken, summarizePermissions } from "../src/token-permissions.mjs";

test("summarizes API permission groups", () => {
  expect(summarizePermissions()).toEqual({ total: 0, read: 0, write: 0, other: 0 });
  expect(summarizePermissions(["DNS Read", "DNS Write", "Billing"])).toEqual({ total: 3, read: 1, write: 1, other: 1 });
});

test("discovers user-token permissions from token details", async () => {
  const fetchImpl = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ result: { id: "token-1", status: "active" } }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ result: { policies: [
      { effect: "allow", permission_groups: [{ name: "DNS Read" }, { name: "DNS Write" }] },
      { effect: "deny", permission_groups: [{ name: "Billing Write" }] },
    ] } }) });
  await expect(inspectApiToken({ token: "cfut_token", fetchImpl })).resolves.toMatchObject({
    tokenId: "token-1", permissionsKnown: true, permissions: ["DNS Read", "DNS Write"],
    permissionSummary: { total: 2, read: 1, write: 1, other: 0 },
  });
  expect(fetchImpl).toHaveBeenNthCalledWith(2, "https://api.cloudflare.com/client/v4/user/tokens/token-1", expect.anything());
});

test("verifies account tokens without falsely claiming permissions", async () => {
  const fetchImpl = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: { id: "token-1", status: "active" } }) });
  await expect(inspectApiToken({ token: "cfat_token", accountId: "account-1", fetchImpl })).resolves.toMatchObject({ permissionsKnown: false, permissions: [] });
  expect(fetchImpl).toHaveBeenCalledWith("https://api.cloudflare.com/client/v4/accounts/account-1/tokens/verify", expect.anything());
});

test("rejects inactive tokens and tolerates unavailable token details", async () => {
  const inactive = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: { status: "expired" } }) });
  await expect(inspectApiToken({ token: "cfut_token", fetchImpl: inactive })).rejects.toThrow("API token is not active");
  const unavailable = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ result: { id: "token-1", status: "active" } }) })
    .mockResolvedValueOnce({ ok: false, json: async () => ({}) });
  await expect(inspectApiToken({ token: "cfut_token", fetchImpl: unavailable })).resolves.toMatchObject({ permissionsKnown: false });
});
