import { jest } from "@jest/globals";
import { bindPickerBulkEvents } from "../../../src/oauth-web/picker/bulk-events.mjs";

const control = () => ({
  handlers: {},
  addEventListener(event, handler) {
    this.handlers[event] = handler;
  },
});

test("bulk controls enable all scopes and preserve required scopes on disable", () => {
  const enable = control();
  const disable = control();
  globalThis.document = {
    querySelector: (selector) =>
      ({ "[data-all-enable]": enable, "[data-all-disable]": disable })[selector],
  };
  const boxes = [{ value: "zone.read" }, { value: "dns.read" }];
  const required = new Set(["identity"]);
  const selected = new Set(["identity"]);
  const render = jest.fn();
  bindPickerBulkEvents({ required, selected, boxes, render });
  enable.handlers.click();
  expect(selected).toEqual(new Set(["identity", "zone.read", "dns.read"]));
  disable.handlers.click();
  expect(selected).toEqual(required);
  expect(render).toHaveBeenNthCalledWith(1);
  expect(render).toHaveBeenLastCalledWith(false);
});
