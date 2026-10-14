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

test("loads every zone page and DNS records for every zone", async () => {
  const zones = Array.from({ length: 50 }, (_, index) => ({ id: `zone-${index}` }));
  const fetchImpl = jest.fn(async (url) => {
    let result = [];
    if (url.endsWith("zones?per_page=50&page=1")) result = zones;
    else if (url.endsWith("zones?per_page=50&page=2")) result = [{ id: "zone-last" }];
    else if (url.includes("zone-0/dns_records")) result = [{ id: "dns-1" }];
    else if (url.includes("zone-last/dns_records")) result = [{ id: "dns-2" }];
    return { ok: true, json: async () => ({ result }) };
  });
  const data = await loadOAuthAccountData({ enabled, accessToken: "token", fetchImpl });
  expect(data.zones).toHaveLength(51);
  expect(data.dns).toEqual([{ id: "dns-1" }, { id: "dns-2" }]);
  expect(fetchImpl).toHaveBeenCalledWith(
    "https://api.cloudflare.com/client/v4/zones?per_page=50&page=2",
    expect.any(Object),
  );
  expect(fetchImpl).toHaveBeenCalledWith(
    "https://api.cloudflare.com/client/v4/zones/zone-last/dns_records?per_page=50&page=1",
    expect.any(Object),
  );
});

test("requests DNS data for independent zones in parallel", async () => {
  const pending = [];
  const fetchImpl = jest.fn((url) => {
    if (url.includes("/zones?"))
      return Promise.resolve({
        ok: true,
        json: async () => ({ result: [{ id: "one" }, { id: "two" }] }),
      });
    return new Promise((resolve) => pending.push(resolve));
  });
  const loading = loadOAuthAccountData({ enabled, accessToken: "token", fetchImpl });
  await new Promise((resolve) => setImmediate(resolve));
  expect(pending).toHaveLength(2);
  for (const resolve of pending) resolve({ ok: true, json: async () => ({ result: [] }) });
  await expect(loading).resolves.toMatchObject({ zones: [{ id: "one" }, { id: "two" }], dns: [] });
});
