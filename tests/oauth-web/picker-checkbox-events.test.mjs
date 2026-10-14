import { jest } from "@jest/globals";
import { bindPickerCheckboxEvents } from "../../src/oauth-web/picker-checkbox-events.mjs";

const control = (value, checked) => ({
  value,
  checked,
  addEventListener(event, handler) {
    this.handlers ||= {};
    this.handlers[event] = handler;
  },
});

test("updates selected scopes and disables modules with no selected scopes", () => {
  const read = control("zone.read", true);
  const write = control("zone.write", false);
  const unknown = control("unknown", false);
  const selected = new Set(["zone.read"]);
  const enabledModules = new Set(["zones"]);
  const render = jest.fn();
  bindPickerCheckboxEvents({
    selected,
    enabledModules,
    owners: new Map([["zone.read", ["zones"]]]),
    boxes: [read, write, unknown],
    render,
  });
  read.checked = false;
  read.handlers.change();
  write.checked = true;
  write.handlers.change();
  unknown.handlers.change();
  expect(selected).toEqual(new Set(["zone.write"]));
  expect(enabledModules.has("zones")).toBe(false);
  expect(render).toHaveBeenCalledTimes(3);
});
