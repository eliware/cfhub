import { jest } from "@jest/globals";
import { buildZoneSecurityReport } from "../../../../src/handlers/zone/security/report.mjs";
import { handleZoneReport } from "../../../../src/handlers/zone/reports.mjs";

test("loads security settings and builds the baseline report", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: [{ id: "ssl" }] }) };
  await expect(buildZoneSecurityReport(cf, "zone")).resolves.toEqual({
    zoneId: "zone",
    settings: [{ id: "ssl" }],
    missing: ["min_tls_version", "always_use_https", "tls_1_3"],
  });
  expect(cf.get).toHaveBeenCalledWith("/zones/zone/settings");
});

test("coordinates JSON and text security reports", async () => {
  const settings = ["ssl", "min_tls_version", "always_use_https", "tls_1_3", "other"].map((id) => ({
    id,
  }));
  const toJsonOutput = jest.fn();
  const cf = { get: jest.fn().mockResolvedValue({ result: settings }) };
  await handleZoneReport({
    cf,
    action: "settings",
    opts: { "zone-id": "zone" },
    outputJson: true,
    toJsonOutput,
    printer: { log: jest.fn() },
    fail: jest.fn(),
  });
  expect(toJsonOutput).toHaveBeenCalledWith({
    zoneId: "zone",
    settings: settings.slice(0, 4),
    missing: [],
  });

  const printer = { log: jest.fn() };
  await handleZoneReport({
    cf: { get: jest.fn().mockResolvedValue({}) },
    action: "settings",
    opts: { "zone-id": "zone" },
    outputJson: false,
    printer,
    fail: jest.fn(),
  });
  expect(printer.log).toHaveBeenCalledWith(expect.stringContaining('"missing"'));
});
