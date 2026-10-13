import { createPickerState } from "../../src/oauth-web/picker-state.mjs";

test("picker state tracks module scopes, shared owners, requirements, and tiers", () => {
  const one = { id: "one", tier: "basic", scopes: ["shared", "one"] };
  const state = createPickerState(
    [
      one,
      { id: "two", tier: "basic", scopes: ["two", "required"] },
      { id: "three", tier: "advanced", scopes: ["shared", "three"] },
    ],
    ["required"],
  );
  expect(state.owners.get("shared")).toEqual(["one", "three"]);
  state.enableModule("missing");
  state.disableModule("missing");
  state.enableModule("one");
  state.enableModule("three");
  one.scopes.push("orphan");
  state.selected.add("orphan");
  state.disableModule("one");
  expect(state.selected).toEqual(new Set(["required", "shared", "three"]));
  state.disableModule("three");
  expect(state.selected).toEqual(new Set(["required"]));
  state.enableModule("two");
  state.disableModule("two");
  expect(state.selected).toEqual(new Set(["required"]));
  state.moduleTier("basic", true);
  expect(state.enabledModules).toEqual(new Set(["one", "two"]));
  state.moduleTier("basic", false);
  expect(state.enabledModules).toEqual(new Set());
  state.moduleTier("unknown", true);
  state.moduleTier("unknown", false);
  expect(state.selected).toEqual(new Set(["required"]));
});
