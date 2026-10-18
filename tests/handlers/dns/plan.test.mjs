import { buildDnsPlan } from "../../../src/handlers/dns/plan.mjs";

test("DNS plan separates new, removed, and unchanged records", () => {
  const same = { type: "A", name: "www", content: "192.0.2.1", ttl: 1, proxied: false };
  const added = { type: "A", name: "api", content: "192.0.2.2", ttl: 1, proxied: false };
  const removed = { type: "A", name: "old", content: "192.0.2.3", ttl: 1, proxied: false };
  expect(buildDnsPlan("zone", [same, added], [same, { ...removed, id: "old-id" }])).toEqual({
    zoneId: "zone",
    add: [added],
    remove: [{ ...removed, id: "old-id" }],
    unchanged: [same],
  });
});

test("DNS plan compares every managed record field", () => {
  const current = { type: "A", name: "www", content: "192.0.2.1", ttl: 1, proxied: false };
  const desired = { ...current, proxied: true };
  expect(buildDnsPlan("zone", [desired], [current])).toMatchObject({
    add: [desired],
    remove: [current],
    unchanged: [],
  });
});
