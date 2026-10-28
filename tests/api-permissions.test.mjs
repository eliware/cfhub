import { missingApiPermissions, requiredApiPermissions } from "../src/api-permissions.mjs";

test("maps OAuth scopes to API token permission names", () => {
  expect(requiredApiPermissions("dns-records", "create")).toEqual(["DNS Write"]);
  expect(requiredApiPermissions("workers", "list")).toEqual(["Workers Scripts Read"]);
  expect(requiredApiPermissions("workers", "create")).toEqual(["Workers Scripts Write"]);
  expect(requiredApiPermissions("zone-settings", "get")).toEqual(["Zone Settings Read"]);
});

test("reports missing API token permissions without case sensitivity", () => {
  expect(missingApiPermissions("dns-records", "create", ["DNS Read"])).toEqual(["DNS Write"]);
  expect(missingApiPermissions("dns-records", "create", ["dns write"])).toEqual([]);
  expect(missingApiPermissions("dns-records", "create", null)).toEqual([]);
});

test("maps API request paths and methods to token permissions", () => {
  expect(requiredApiPermissions("api", "/zones/zone/dns_records", { method: "POST" })).toEqual([
    "DNS Write",
  ]);
  expect(requiredApiPermissions("api", "/zones/zone/dns_records", { method: "GET" })).toEqual([
    "DNS Read",
  ]);
  expect(
    missingApiPermissions("api", "/zones/zone/dns_records", ["DNS Read"], {
      method: "POST",
    }),
  ).toEqual(["DNS Write"]);
  expect(missingApiPermissions("api", "/custom/unknown", [], { method: "GET" })).toEqual([
    "Cannot verify this API path and method against known permissions",
  ]);
});

test.each([
  ["/zones", "GET", "Zone Read"],
  ["/zones/zone", "POST", "Zone Write"],
  ["/zones/zone/settings/ssl", "GET", "Zone Settings Read"],
  ["/zones/zone/ssl/certificate_packs", "GET", "SSL and Certificates Read"],
  ["/zones/zone/certificates", "POST", "SSL and Certificates Write"],
  ["/zones/zone/firewall/rules", "GET", "Zone WAF Read"],
  ["/zones/zone/filters", "PATCH", "Zone WAF Write"],
  ["/zones/zone/load_balancers", "GET", "Load Balancing Monitors and Pools Read"],
  ["/zones/zone/pools", "POST", "Load Balancing Monitors and Pools Write"],
  ["/zones/zone/monitors", "PUT", "Load Balancing Monitors and Pools Write"],
  ["/zones/zone/healthchecks", "GET", "Healthcheck Read"],
  ["/zones/zone/purge_cache", "POST", "Cache Purge"],
  ["/accounts", "GET", "Account Settings Read"],
  ["/accounts/account", "POST", "Account Settings Write"],
  ["/accounts/account/rules/lists", "GET", "Account Rule Lists Read"],
  ["/accounts/account/rulesets", "POST", "Account Rulesets Write"],
  ["/accounts/account/cfd_tunnel", "GET", "Argo Tunnel Read"],
  ["/accounts/account/workers/scripts", "GET", "Workers Scripts Read"],
  ["/accounts/account/pages/projects", "POST", "Page Write"],
  ["/accounts/account/r2/buckets", "GET", "Workers R2 Read"],
  ["/accounts/account/d1/database", "POST", "D1 Write"],
  ["/accounts/account/queues", "GET", "Queues Read"],
  ["/accounts/account/stream", "GET", "Stream Read"],
  ["/accounts/account/images/v1", "GET", "Images Read"],
  ["/accounts/account/ai/run", "POST", "AI Write"],
  ["/accounts/account/access/apps", "GET", "Access Read"],
  ["/accounts/account/audit_logs", "GET", "Account Settings Read"],
])("maps %s with %s to %s", (path, method, permission) => {
  expect(requiredApiPermissions("api", path, { method })).toEqual([permission]);
});

test("fails closed when an API path or method cannot be mapped", () => {
  expect(requiredApiPermissions("api", "/zones")).toEqual(["Zone Read"]);
  expect(requiredApiPermissions("api", "/zones", { method: "" })).toEqual(["Zone Read"]);
  expect(requiredApiPermissions("api", null, { method: "GET" })).toEqual([]);
  expect(requiredApiPermissions("api", "/zones/%ZZ", { method: "GET" })).toEqual([]);
  expect(requiredApiPermissions("api", "/zones", { method: "TRACE" })).toEqual([]);
  expect(requiredApiPermissions("api", "/zones", { method: "GET", dryRun: true })).toEqual([
    "Zone Read",
  ]);
  expect(requiredApiPermissions("api", "/zones/zone/purge_cache", { method: "GET" })).toEqual([
    "Cache Read",
  ]);
  expect(requiredApiPermissions("api", "/zones/zone/unknown", { method: "GET" })).toEqual([]);
  expect(
    requiredApiPermissions("api", "/zones/zone/purge_cache", { method: "POST", dryRun: true }),
  ).toEqual(["Cache Purge"]);
  expect(requiredApiPermissions("api", "", { method: "GET" })).toEqual([]);
  expect(requiredApiPermissions("api", "/zones/zone/dns_records", { method: "post" })).toEqual([
    "DNS Write",
  ]);
  expect(requiredApiPermissions("api", "/accounts/account/unknown", { method: "GET" })).toEqual([]);
  expect(requiredApiPermissions("cache", "purge")).toEqual(["Cache Purge"]);
  expect(missingApiPermissions("api", "/zones", null, { method: "GET" })).toEqual([]);
  expect(missingApiPermissions("api", "/zones", ["Zone Read"], { method: "GET" })).toEqual([]);
});
