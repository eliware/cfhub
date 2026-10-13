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
