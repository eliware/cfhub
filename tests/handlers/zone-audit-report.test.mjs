import { jest } from "@jest/globals";
import { buildZoneAuditReport } from "../../src/handlers/zone-audit-report.mjs";

test("collects zone, SSL, and DNS data from the generic client", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: [{ id: "record" }] }) };
  await expect(buildZoneAuditReport(cf, "zone")).resolves.toEqual({
    zone: { result: [{ id: "record" }] },
    ssl: { result: [{ id: "record" }] },
    dns: [{ id: "record" }],
  });
});
