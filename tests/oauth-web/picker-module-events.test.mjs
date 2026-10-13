import { jest } from "@jest/globals";
import { bindPickerModuleEvents } from "../../src/oauth-web/picker-module-events.mjs";

const control = (dataset = {}) => ({
  dataset,
  addEventListener(event, handler) {
    this.handlers ||= {};
    this.handlers[event] = handler;
  },
});

test("binds module, tier, and shared session controls", () => {
  const module = control({ module: "zones" });
  const enable = control({ tierEnable: "basic" });
  const disable = control({ tierDisable: "basic" });
  const sessions = [control(), control()];
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
    sessionOptions: sessions,
    moduleTier,
    enableModule,
    disableModule,
    render,
  });
  sessions[0].checked = true;
  sessions[0].handlers.change();
  module.handlers.click();
  module.handlers.click();
  enable.handlers.click();
  disable.handlers.click();
  expect(sessions[1].checked).toBe(true);
  expect(enableModule).toHaveBeenCalledWith("zones");
  expect(disableModule).toHaveBeenCalledWith("zones");
  expect(moduleTier.mock.calls).toEqual([
    ["basic", true],
    ["basic", false],
  ]);
  expect(render).toHaveBeenCalledTimes(4);
});
