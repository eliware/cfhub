import { jest } from "@jest/globals";
import { collectZoneInventory } from "../../src/handlers/inventory-zone.mjs";

test("collects records and SSL through direct API calls", async () => {
  const cf = { get: jest.fn().mockResolvedValue({ result: [{ id: "record" }] }) };
  await expect(
    collectZoneInventory(cf, { id: "zone", name: "example.com", status: "active" }),
  ).resolves.toEqual({
    id: "zone",
    name: "example.com",
    status: "active",
    records: [{ id: "record" }],
    ssl: { result: [{ id: "record" }] },
  });
  expect(cf.get).toHaveBeenCalledTimes(2);
});

test("collects records and SSL through SDK methods", async () => {
  const cf = {
    dns: { records: { list: jest.fn().mockResolvedValue({ result: [{ id: "record" }] }) } },
    zones: { settings: { get: jest.fn().mockResolvedValue({ value: "strict" }) } },
  };
  await expect(collectZoneInventory(cf, { id: "zone" })).resolves.toMatchObject({
    records: [{ id: "record" }],
    ssl: { value: "strict" },
  });
  expect(cf.dns.records.list).toHaveBeenCalledWith({ zone_id: "zone" });
  expect(cf.zones.settings.get).toHaveBeenCalledWith("zone", "ssl");
});
