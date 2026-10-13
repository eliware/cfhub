import { jest } from "@jest/globals";
import { handleZoneReport } from "../../src/handlers/zone-reports.mjs";

test("zone reports return audit data in JSON", async () => {
  const ctx = {
    cf: { get: jest.fn().mockResolvedValue({ result: [] }) },
    action: "audit",
    opts: { "zone-id": "z" },
    outputJson: true,
    toJsonOutput: jest.fn(),
    printer: { log: jest.fn() },
    fail: jest.fn(),
  };
  await handleZoneReport(ctx);
  expect(ctx.toJsonOutput).toHaveBeenCalledWith({
    zone: { result: [] },
    ssl: { result: [] },
    dns: [],
  });
});
