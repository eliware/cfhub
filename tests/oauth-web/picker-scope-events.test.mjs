import { jest } from "@jest/globals";
import { bindPickerScopeEvents } from "../../src/oauth-web/picker-scope-events.mjs";

const control = () => ({
  handlers: {},
  addEventListener(event, handler) {
    this.handlers[event] = handler;
  },
});

test("binds individual scope changes", () => {
  const read = Object.assign(control(), { value: "zone.read", checked: true });
  const write = Object.assign(control(), { value: "zone.write", checked: false });
  const unowned = Object.assign(control(), { value: "unknown", checked: false });
  globalThis.document = {
    querySelector: () => control(),
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
    boxes: [read, write, unowned],
    render,
  });
  read.checked = false;
  read.handlers.change();
  expect(enabledModules.has("zones")).toBe(false);
  write.checked = true;
  write.handlers.change();
  unowned.handlers.change();
  expect(selected).toEqual(new Set(["required", "zone.write"]));
  expect(render).toHaveBeenCalledTimes(3);
});
