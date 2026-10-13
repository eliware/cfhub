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

test("OAuth summary handles missing zones and failed requests", async () => {
  expect(copyrightYear()).toBe("2026");
  const fetchImpl = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: [{}] }) });
  const noZoneId = await collectOAuthSummary({
    accessToken: "x",
    account: null,
    scopes: ["zone.read", "zone.write"],
    fetchImpl,
  });
  expect(noZoneId.zones).toEqual([{}]);
  expect(noZoneId.dns).toEqual([]);
  const failed = await collectOAuthSummary({
    accessToken: "x",
    account: null,
    scopes: ["zone.read", "zone.write"],
    fetchImpl: jest.fn().mockRejectedValue(Error("offline")),
  });
  expect(failed.errors).toEqual(["offline"]);
  const disabled = await collectOAuthSummary({
    accessToken: "x",
    account: null,
    scopes: [],
    fetchImpl: jest.fn(),
  });
  expect(disabled.enabled).toEqual([]);
  expect(disabled.errors).toEqual([]);
});

test("OAuth summary ignores responses without result data", async () => {
  const summary = await collectOAuthSummary({
    accessToken: "x",
    account: null,
    scopes: ["zone.read", "zone.write"],
    fetchImpl: jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
  });
  expect(summary.zones).toEqual([]);
});
