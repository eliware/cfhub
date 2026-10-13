import { syncPickerModuleState } from "../../src/oauth-web/picker-module-state.mjs";

test("enables modules when all required scopes are selected", () => {
  const modules = [
    { id: "zones", scopes: ["zone.read", "zone.write"] },
    { id: "dns", scopes: ["dns.read"] },
  ];
  const enabled = new Set(["dns"]);
  syncPickerModuleState(modules, new Set(["zone.read", "zone.write"]), enabled);
  expect(enabled).toEqual(new Set(["zones"]));
});
