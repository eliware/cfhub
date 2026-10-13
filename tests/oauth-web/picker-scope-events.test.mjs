import { jest } from "@jest/globals";
import { bindPickerScopeEvents } from "../../src/oauth-web/picker-scope-events.mjs";

const control = () => ({
  handlers: {},
  addEventListener(event, handler) {
    this.handlers[event] = handler;
  },
});

test("binds individual scope and all-scope controls", () => {
  const read = Object.assign(control(), { value: "zone.read", checked: true });
  const write = Object.assign(control(), { value: "zone.write", checked: false });
  const enable = control();
  const disable = control();
  globalThis.document = {
    querySelector: (selector) =>
      ({ "[data-all-enable]": enable, "[data-all-disable]": disable })[selector],
    querySelectorAll: () => [],
  };
  const selected = new Set(["zone.read", "required"]);
  const enabledModules = new Set(["zones"]);
  const required = new Set(["required"]);
  const render = jest.fn();
  bindPickerScopeEvents({
    categories: {},
    required,
    selected,
    enabledModules,
    owners: new Map([["zone.read", ["zones"]]]),
    boxes: [read, write],
    render,
  });
  read.checked = false;
  read.handlers.change();
  expect(enabledModules.has("zones")).toBe(false);
  write.checked = true;
  write.handlers.change();
  enable.handlers.click();
  disable.handlers.click();
  expect(selected).toEqual(required);
  expect(render).toHaveBeenLastCalledWith(false);
});
