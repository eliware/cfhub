import { permissionNames, summarizePermissions } from "../src/permission-summary.mjs";

test("filters, sorts, and deduplicates permission groups", () => {
  expect(
    permissionNames({
      result: {
        policies: [
          { effect: "allow", permission_groups: [{ name: "Zone Write" }, { name: "Zone Read" }] },
          { effect: "deny", permission_groups: [{ name: "Secret" }] },
        ],
      },
    }),
  ).toEqual(["Zone Read", "Zone Write"]);
  expect(permissionNames()).toEqual([]);
});

test("counts read, write, and other permission names", () => {
  expect(summarizePermissions(["zone:read", "dns:manage", "account:billing"])).toEqual({
    total: 3,
    read: 1,
    write: 1,
    other: 1,
  });
  expect(summarizePermissions()).toEqual({ total: 0, read: 0, write: 0, other: 0 });
});
