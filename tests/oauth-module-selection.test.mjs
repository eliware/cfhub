import { selectOAuthModules } from "../src/oauth-module-selection.mjs";

test("selects modules only when every module scope is granted", () => {
  const modules = [
    { id: "zones", scopes: ["zone.read"] },
    { id: "dns", scopes: ["zone.read", "dns.read"] },
  ];
  expect(selectOAuthModules(modules, ["zone.read"]).map(({ id }) => id)).toEqual(["zones"]);
  expect(selectOAuthModules(modules, ["zone.read", "dns.read"])).toEqual(modules);
});
