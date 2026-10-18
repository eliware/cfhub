import { syncPickerModuleState } from "../../../../src/oauth-web/picker/module/sync.mjs";

test("syncs enabled modules from selected scopes", () => {
  const enabled = new Set(["dns"]);
  const modules = [
    { id: "zones", scopes: ["zone.read", "zone.write"] },
    { id: "dns", scopes: ["dns.read"] },
  ];
  syncPickerModuleState(modules, new Set(["zone.read", "zone.write"]), enabled);
  expect(enabled).toEqual(new Set(["zones"]));
  syncPickerModuleState(modules, new Set(["dns.read"]), enabled);
  expect(enabled).toEqual(new Set(["dns"]));
});
