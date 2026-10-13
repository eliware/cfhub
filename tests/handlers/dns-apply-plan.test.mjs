import { jest } from "@jest/globals";
import { applyDnsPlan } from "../../src/handlers/dns-apply-plan.mjs";

test("DNS plan uses direct API writes in plan order", async () => {
  const cf = { post: jest.fn(), delete: jest.fn() };
  const plan = {
    zoneId: "zone-1",
    add: [{ type: "A", name: "new" }],
    remove: [{ id: "old" }],
  };
  await applyDnsPlan(cf, plan);
  expect(cf.post).toHaveBeenCalledWith("/zones/zone-1/dns_records", {
    body: { type: "A", name: "new" },
  });
  expect(cf.delete).toHaveBeenCalledWith("/zones/zone-1/dns_records/old");
});

test("DNS plan uses the SDK when direct API methods are absent", async () => {
  const cf = {
    dns: {
      records: { create: jest.fn(), delete: jest.fn() },
    },
  };
  await applyDnsPlan(cf, {
    zoneId: "zone-1",
    add: [{ type: "A", name: "new" }],
    remove: [{ id: "old" }],
  });
  expect(cf.dns.records.create).toHaveBeenCalledWith({
    zone_id: "zone-1",
    type: "A",
    name: "new",
  });
  expect(cf.dns.records.delete).toHaveBeenCalledWith("old", { zone_id: "zone-1" });
});
