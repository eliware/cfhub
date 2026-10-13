import { jest } from "@jest/globals";
import { bindPickerEvents } from "../../src/oauth-web/picker-events.mjs";

const control = (dataset = {}) => ({
  dataset,
  handlers: {},
  addEventListener(event, callback) {
    this.handlers[event] = callback;
  },
});

test("picker events update scopes, modules, tiers, categories, and navigation", () => {
  const module = control({ module: "zones" });
  const tierEnable = control({ tierEnable: "basic" });
  const tierDisable = control({ tierDisable: "basic" });
  const categoryEnable = control({ categoryEnable: "zones" });
  const categoryDisable = control({ categoryDisable: "zones" });
  const expand = control();
  const collapse = control();
  const search = control();
  const allEnable = control();
  const allDisable = control();
  const boxRead = control();
  Object.assign(boxRead, { value: "zone.read", checked: true });
  const boxWrite = control();
  Object.assign(boxWrite, { value: "zone.write", checked: false });
  const options = [control(), control()];
  const categoriesList = [{ textContent: "DNS records", open: false }];
  const controls = {
    "[data-module]": [module],
    "[data-tier-enable]": [tierEnable],
    "[data-tier-disable]": [tierDisable],
    "[data-category-enable]": [categoryEnable],
    "[data-category-disable]": [categoryDisable],
    ".category": categoriesList,
  };
  globalThis.document = {
    querySelector: (selector) =>
      ({
        "[data-all-enable]": allEnable,
        "[data-all-disable]": allDisable,
        "[data-expand]": expand,
        "[data-collapse]": collapse,
        "#scope-search": search,
      })[selector],
    querySelectorAll: (selector) => controls[selector] || [],
  };
  const selected = new Set(["required"]);
  const required = new Set(["required"]);
  const enabledModules = new Set();
  const render = jest.fn();
  const moduleTier = jest.fn();
  const enableModule = jest.fn((id) => enabledModules.add(id));
  const disableModule = jest.fn((id) => enabledModules.delete(id));
  bindPickerEvents({
    categories: { zones: [{ scopes: [{ scope: "zone.read" }, { scope: "required" }] }] },
    required,
    selected,
    enabledModules,
    owners: new Map([["zone.read", ["zones"]]]),
    boxes: [boxRead, boxWrite],
    sessionOptions: options,
    moduleTier,
    enableModule,
    disableModule,
    render,
  });
  boxRead.handlers.change();
  boxWrite.checked = true;
  boxWrite.handlers.change();
  expect(selected).toEqual(new Set(["required", "zone.read", "zone.write"]));
  boxRead.checked = false;
  boxRead.handlers.change();
  boxWrite.checked = false;
  boxWrite.handlers.change();
  expect(selected.has("zone.write")).toBe(false);
  options[0].checked = true;
  options[0].handlers.change();
  expect(options[1].checked).toBe(true);
  module.handlers.click();
  module.handlers.click();
  expect(enableModule).toHaveBeenCalledWith("zones");
  expect(disableModule).toHaveBeenCalledWith("zones");
  tierEnable.handlers.click();
  tierDisable.handlers.click();
  expect(moduleTier.mock.calls).toEqual([
    ["basic", true],
    ["basic", false],
  ]);
  categoryEnable.handlers.click();
  expect(selected.has("zone.read")).toBe(true);
  categoryDisable.handlers.click();
  expect(selected.has("required")).toBe(true);
  allEnable.handlers.click();
  expect(selected.has("zone.write")).toBe(true);
  allDisable.handlers.click();
  expect(selected).toEqual(new Set(["required"]));
  expect(enabledModules.size).toBe(0);
  expect(render).toHaveBeenLastCalledWith(false);
  expand.handlers.click();
  expect(categoriesList[0].open).toBe(true);
  collapse.handlers.click();
  expect(categoriesList[0].open).toBe(false);
  search.handlers.input({ target: { value: "zone" } });
  expect(categoriesList[0]).toMatchObject({ hidden: true, open: false });
  categoriesList[0].textContent = "Zone settings";
  search.handlers.input({ target: { value: "ZONE" } });
  expect(categoriesList[0]).toMatchObject({ hidden: false, open: true });
});
