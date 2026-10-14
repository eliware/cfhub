import { jest } from "@jest/globals";
import { bindPickerModuleEvents } from "../../src/oauth-web/picker-module-events.mjs";

const control = (dataset = {}) => ({
  dataset,
  addEventListener(event, handler) {
    this.handlers ||= {};
    this.handlers[event] = handler;
  },
});

test("binds module and tier controls", () => {
  const module = control({ module: "zones" });
  const enable = control({ tierEnable: "basic" });
  const disable = control({ tierDisable: "basic" });
  globalThis.document = {
    querySelectorAll: (selector) =>
      ({
        "[data-module]": [module],
        "[data-tier-enable]": [enable],
        "[data-tier-disable]": [disable],
      })[selector] || [],
  };
  const enabled = new Set();
  const enableModule = jest.fn(() => enabled.add("zones"));
  const disableModule = jest.fn(() => enabled.delete("zones"));
  const moduleTier = jest.fn();
  const render = jest.fn();
  bindPickerModuleEvents({
    enabledModules: enabled,
    moduleTier,
    enableModule,
    disableModule,
    render,
  });
  module.handlers.click();
  module.handlers.click();
  enable.handlers.click();
  disable.handlers.click();
  expect(enableModule).toHaveBeenCalledWith("zones");
  expect(disableModule).toHaveBeenCalledWith("zones");
  expect(moduleTier.mock.calls).toEqual([
    ["basic", true],
    ["basic", false],
  ]);
  expect(render).toHaveBeenCalledTimes(4);
});
