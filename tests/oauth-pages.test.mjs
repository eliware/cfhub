import { jest } from "@jest/globals";
import { collectOAuthSummary, copyrightYear } from "../src/oauth-pages.mjs";

test("OAuth summary and copyright helpers cover populated results", async () => {
  expect(copyrightYear(2026)).toBe("2026");
  expect(copyrightYear(2027)).toBe("2026-2027");
  const summary = await collectOAuthSummary({
    accessToken: "access",
    account: { name: "account" },
    scopes: ["zone.read", "zone.write", "dns.read", "dns.write"],
    fetchImpl: jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: [{ id: "zone-1" }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: [{ id: "record-1" }] }) }),
  });
  expect(summary.zones).toEqual([{ id: "zone-1" }]);
  expect(summary.dns).toEqual([{ id: "record-1" }]);
  const unavailable = await collectOAuthSummary({
    accessToken: "access",
    account: null,
    scopes: ["zone.read", "zone.write", "dns.read", "dns.write"],
    fetchImpl: jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: [{ id: "zone-1" }] }) })
      .mockResolvedValueOnce({ ok: false }),
  });
  expect(unavailable.dns).toEqual([]);
});
