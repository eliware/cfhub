import { jest } from "@jest/globals";
import { collectZonesInBatches } from "../../../src/handlers/inventory/collect-zones.mjs";

test("limits concurrent zones and keeps inventory order", async () => {
  const zones = Array.from({ length: 6 }, (_, index) => ({
    id: `z${index}`,
    name: `zone-${index}`,
  }));
  let active = 0;
  let maximum = 0;
  const cf = {
    get: jest.fn((path) => {
      active += 1;
      maximum = Math.max(maximum, active);
      return new Promise((resolve) =>
        queueMicrotask(() => {
          active -= 1;
          resolve(path.endsWith("dns_records") ? { result: [] } : { value: "strict" });
        }),
      );
    }),
  };
  const inventory = await collectZonesInBatches(cf, zones);
  expect(inventory.map((zone) => zone.id)).toEqual(zones.map((zone) => zone.id));
  expect(maximum).toBeLessThanOrEqual(10);
  expect(maximum).toBeGreaterThan(2);
});

test("returns an empty inventory when there are no zones", async () => {
  await expect(collectZonesInBatches({ get: jest.fn() }, [])).resolves.toEqual([]);
});
