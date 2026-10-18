import { successPageCounts } from "../../../src/oauth/success/counts.mjs";

test("projects OAuth success collection counts to template values", () => {
  expect(
    successPageCounts({
      scopes: ["zone.read", "dns.read"],
      enabled: [{ id: "zones" }],
      zones: [{ name: "one" }, { name: "two" }],
      dns: [{ name: "www" }],
    }),
  ).toEqual({ scopeCount: "2", enabledCount: "1", zoneCount: "2", dnsCount: "1" });
});
