import { jest } from "@jest/globals";
import { bindPickerCategoryEvents } from "../../../src/oauth-web/picker/category-events.mjs";

test("category controls add scopes and preserve required scopes on removal", () => {
  const enable = {
    dataset: { categoryEnable: "zone" },
    addEventListener: (_name, fn) => (enable.click = fn),
  };
  const disable = {
    dataset: { categoryDisable: "zone" },
    addEventListener: (_name, fn) => (disable.click = fn),
  };
  globalThis.document = {
    querySelectorAll: (name) => (name.includes("enable") ? [enable] : [disable]),
  };
  const selected = new Set(["required"]);
  const render = jest.fn();
  bindPickerCategoryEvents({
    categories: { zone: [{ scopes: [{ scope: "required" }, { scope: "zone.read" }] }] },
    required: new Set(["required"]),
    selected,
    render,
  });
  enable.click();
  disable.click();
  expect(selected).toEqual(new Set(["required"]));
  expect(render).toHaveBeenCalledTimes(2);
});
