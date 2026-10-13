import {
  createPickerModuleState,
  syncPickerModuleState,
} from "../../src/oauth-web/picker-module-state.mjs";

test("module policy preserves shared and required scopes", () => {
  const modules = [
    { id: "one", tier: "basic", scopes: ["shared", "one"] },
    { id: "two", tier: "basic", scopes: ["two", "required"] },
    { id: "three", tier: "advanced", scopes: ["shared", "three"] },
    { id: "orphan", tier: "advanced", scopes: ["orphan"] },
  ];
  const state = {
    required: new Set(["required"]),
    selected: new Set(["required"]),
    enabledModules: new Set(),
    owners: new Map([
      ["shared", ["one", "three"]],
      ["one", ["one"]],
      ["two", ["two"]],
      ["required", ["two"]],
      ["three", ["three"]],
    ]),
  };
  const policy = createPickerModuleState(modules, state);
  policy.enableModule("missing");
  policy.disableModule("missing");
  policy.enableModule("one");
  policy.enableModule("three");
  policy.enableModule("orphan");
  policy.disableModule("orphan");
  policy.disableModule("one");
  expect(state.selected).toEqual(new Set(["required", "shared", "three"]));
  policy.disableModule("three");
  expect(state.selected).toEqual(new Set(["required"]));
  policy.moduleTier("basic", true);
  expect(state.enabledModules).toEqual(new Set(["one", "two"]));
  policy.moduleTier("basic", false);
  policy.moduleTier("unknown", true);
  policy.moduleTier("unknown", false);
  expect(state.enabledModules).toEqual(new Set());
  expect(state.selected).toEqual(new Set(["required"]));
});

test("syncs module state from selected scopes", () => {
  const enabled = new Set();
  const modules = [
    { id: "zones", scopes: ["zone.read", "zone.write"] },
    { id: "dns", scopes: ["dns.read"] },
  ];
  syncPickerModuleState(modules, new Set(["zone.read", "zone.write"]), enabled);
  expect(enabled).toEqual(new Set(["zones"]));
  syncPickerModuleState(modules, new Set(["dns.read"]), enabled);
  expect(enabled).toEqual(new Set(["dns"]));
});
