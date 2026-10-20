import { moduleCatalog, selectOAuthModules } from "../../src/oauth/module-catalog.mjs";

test("selects catalog modules when their read scopes are granted", () => {
  const selected = selectOAuthModules(moduleCatalog.modules, ["zone.read", "dns.read"]);
  expect(selected.map(({ id }) => id)).toContain("zones");
  expect(selected.map(({ id }) => id)).not.toContain("workers");
});

test("selects modules when their read scopes are granted", () => {
  const modules = [
    { id: "zones", scopes: ["zone.read", "zone.write"] },
    { id: "dns", scopes: ["zone.read", "dns.read", "dns.write"] },
  ];
  expect(selectOAuthModules(modules, ["zone.read"]).map(({ id }) => id)).toEqual(["zones"]);
  expect(selectOAuthModules(modules, ["zone.read", "dns.read"])).toEqual(modules);
});

test("uses every scope when a module has no read scope", () => {
  const modules = [{ id: "purge", scopes: ["cache.purge"] }];
  expect(selectOAuthModules(modules, ["cache.purge"])).toEqual(modules);
  expect(selectOAuthModules(modules, [])).toEqual([]);
});
