import { jest } from "@jest/globals";
import { handleZoneReport } from "../../../src/handlers/zone/reports.mjs";

const context = (overrides = {}) => ({
  cf: { get: jest.fn().mockResolvedValue({ result: [] }) },
  action: "audit",
  opts: { "zone-id": "zone" },
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  fail: (message) => {
    throw new Error(message);
  },
  ...overrides,
});

test("audits zone, SSL, and DNS data through direct endpoints", async () => {
  const toJsonOutput = jest.fn();
  const cf = { get: jest.fn().mockResolvedValue({ result: [{ id: "r" }] }) };
  await handleZoneReport(context({ cf, toJsonOutput }));
  expect(cf.get).toHaveBeenNthCalledWith(1, "/zones/zone", undefined);
  expect(cf.get).toHaveBeenNthCalledWith(2, "/zones/zone/settings/ssl", undefined);
  expect(cf.get).toHaveBeenNthCalledWith(3, "/zones/zone/dns_records", undefined);
  expect(toJsonOutput).toHaveBeenCalledWith({
    zone: { result: [{ id: "r" }] },
    ssl: { result: [{ id: "r" }] },
    dns: [{ id: "r" }],
  });
});

test("audits through generic clients and prints JSON text", async () => {
  const printer = { log: jest.fn() };
  const cf = {
    zones: {
      get: jest.fn().mockResolvedValue({ zone: true }),
      settings: { get: jest.fn().mockResolvedValue({ ssl: true }) },
    },
    dns: { records: { list: jest.fn().mockResolvedValue([{ id: "record" }]) } },
  };
  await handleZoneReport(context({ cf, outputJson: false, printer }));
  expect(cf.zones.get).toHaveBeenCalledWith({ zone_id: "zone" });
  expect(cf.zones.settings.get).toHaveBeenCalledWith("zone", "ssl");
  expect(cf.dns.records.list).toHaveBeenCalledWith({ zone_id: "zone" });
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining('"record"'));
});

test("reports the security settings baseline", async () => {
  const toJsonOutput = jest.fn();
  const settings = ["ssl", "min_tls_version", "always_use_https", "tls_1_3", "other"].map((id) => ({
    id,
  }));
  await handleZoneReport(
    context({
      action: "settings",
      cf: { get: jest.fn().mockResolvedValue({ result: settings }) },
      toJsonOutput,
    }),
  );
  expect(toJsonOutput).toHaveBeenCalledWith({
    zoneId: "zone",
    settings: settings.slice(0, 4),
    missing: [],
  });
  const printer = { log: jest.fn() };
  await handleZoneReport(
    context({
      action: "settings",
      cf: { get: jest.fn().mockResolvedValue({}) },
      outputJson: false,
      printer,
    }),
  );
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining('"missing"'));
});

test("requires a zone ID", async () => {
  await expect(handleZoneReport(context({ opts: {} }))).rejects.toThrow("Missing --zone-id");
});
