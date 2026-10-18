import { jest } from "@jest/globals";
import { collectOAuthSummary } from "../../src/oauth/pages.mjs";

test("OAuth summary assembles selected modules, account data, and errors", async () => {
  const account = { name: "account" };
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ result: [{ id: "zone-1" }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ result: [{ id: "record-1" }] }) });
  const summary = await collectOAuthSummary({
    accessToken: "access",
    account,
    scopes: ["zone.read", "zone.write", "dns.read", "dns.write"],
    fetchImpl,
  });
  expect(summary).toMatchObject({
    account,
    zones: [{ id: "zone-1" }],
    dns: [{ id: "record-1" }],
    errors: [],
  });
  expect(summary.enabled.map(({ id }) => id)).toContain("zones");
});
