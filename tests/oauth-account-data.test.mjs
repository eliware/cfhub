import { jest } from "@jest/globals";
import { loadOAuthAccountData } from "../src/oauth-account-data.mjs";

const enabled = [{ id: "zones" }, { id: "dns" }];

test.each([
  ["zone with DNS records", [{ id: "zone-1" }], [{ id: "record-1" }], 2],
  ["zone without an ID", [{}], [], 1],
])("loads account data for a %s", async (_label, zoneResult, dnsResult, calls) => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ result: zoneResult }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ result: dnsResult }) });
  const data = await loadOAuthAccountData({ enabled, accessToken: "token", fetchImpl });
  expect(data.zones).toEqual(zoneResult);
  expect(data.dns).toEqual(dnsResult);
  expect(fetchImpl).toHaveBeenCalledTimes(calls);
});

test("skips disabled modules and captures failed requests", async () => {
  const disabledFetch = jest.fn();
  await expect(
    loadOAuthAccountData({ enabled: [], accessToken: "token", fetchImpl: disabledFetch }),
  ).resolves.toEqual({ zones: [], dns: [], errors: [] });
  expect(disabledFetch).not.toHaveBeenCalled();

  const failed = await loadOAuthAccountData({
    enabled: [{ id: "zones" }],
    accessToken: "token",
    fetchImpl: jest.fn().mockRejectedValue(Error("offline")),
  });
  expect(failed).toEqual({ zones: [], dns: [], errors: ["offline"] });
});

test("skips DNS when no DNS module is enabled", async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ result: [{ id: "zone-1" }] }) });
  const data = await loadOAuthAccountData({
    enabled: [{ id: "zones" }],
    accessToken: "token",
    fetchImpl,
  });
  expect(data).toEqual({ zones: [{ id: "zone-1" }], dns: [], errors: [] });
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});

test("uses empty data when the API rejects a response or omits its result", async () => {
  const unavailable = await loadOAuthAccountData({
    enabled: [{ id: "zones" }],
    accessToken: "token",
    fetchImpl: jest.fn().mockResolvedValue({ ok: false }),
  });
  expect(unavailable.zones).toEqual([]);

  const empty = await loadOAuthAccountData({
    enabled: [{ id: "zones" }],
    accessToken: "token",
    fetchImpl: jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
  });
  expect(empty.zones).toEqual([]);
});

test("uses an empty DNS list when the DNS response has no result", async () => {
  const fetchImpl = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ result: [{ id: "zone-1" }] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
  await expect(
    loadOAuthAccountData({ enabled, accessToken: "token", fetchImpl }),
  ).resolves.toMatchObject({ zones: [{ id: "zone-1" }], dns: [] });
});
