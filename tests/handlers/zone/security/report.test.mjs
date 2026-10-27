import { jest } from "@jest/globals";
import { buildZoneSecurityReport } from "../../../../src/handlers/zone/security/report.mjs";

test("loads security settings and builds the baseline report", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: [{ id: "ssl" }] }) };
  await expect(buildZoneSecurityReport(cf, "zone")).resolves.toEqual({
    zoneId: "zone",
    settings: [{ id: "ssl" }],
    missing: ["min_tls_version", "always_use_https", "tls_1_3"],
  });
  expect(cf.get).toHaveBeenCalledWith("/zones/zone/settings");
});
