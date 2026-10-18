import { createPickerState } from "../../../src/oauth-web/picker/state.mjs";

test("picker state builds selected, required, enabled, and owner sets", () => {
  const state = createPickerState(
    [
      { id: "one", scopes: ["shared", "one"] },
      { id: "two", scopes: ["shared", "two"] },
    ],
    ["required", "shared"],
  );
  expect(state.required).toEqual(new Set(["required", "shared"]));
  expect(state.selected).toEqual(new Set(["required", "shared"]));
  expect(state.enabledModules).toEqual(new Set());
  expect(state.owners.get("shared")).toEqual(["one", "two"]);
  expect(state.owners.get("one")).toEqual(["one"]);
});
