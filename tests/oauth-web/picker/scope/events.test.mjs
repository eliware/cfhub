import { jest } from "@jest/globals";
import { bindPickerScopeEvents } from "../../../../src/oauth-web/picker/scope/events.mjs";

const control = (dataset = {}) => ({
  dataset,
  handlers: {},
  addEventListener(event, handler) {
    this.handlers[event] = handler;
  },
});

test("wires category and bulk scope controls", () => {
  const categoryEnable = control({ categoryEnable: "zones" });
  const allDisable = control();
  globalThis.document = {
    querySelector: (selector) => (selector === "[data-all-disable]" ? allDisable : control()),
    querySelectorAll: (selector) => (selector === "[data-category-enable]" ? [categoryEnable] : []),
  };
  const selected = new Set();
  const render = jest.fn();
  bindPickerScopeEvents({
    categories: { zones: [{ scopes: [{ scope: "zone.read" }] }] },
    required: new Set(["required"]),
    selected,
    enabledModules: new Set(),
    owners: new Map(),
    boxes: [],
    render,
  });
  categoryEnable.handlers.click();
  expect(selected.has("zone.read")).toBe(true);
  allDisable.handlers.click();
  expect(selected).toEqual(new Set(["required"]));
  expect(render).toHaveBeenCalledTimes(2);
});
