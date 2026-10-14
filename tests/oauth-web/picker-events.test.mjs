import { bindPickerEvents } from "../../src/oauth-web/picker-events.mjs";

const control = (dataset = {}) => ({
  dataset,
  handlers: {},
  addEventListener(event, callback) {
    this.handlers[event] = callback;
  },
});

test("picker event wiring registers each control handler", () => {
  const scope = control();
  const module = control({ module: "zones" });
  const tierEnable = control({ tierEnable: "basic" });
  const tierDisable = control({ tierDisable: "basic" });
  const categoryEnable = control({ categoryEnable: "zones" });
  const categoryDisable = control({ categoryDisable: "zones" });
  const allEnable = control();
  const allDisable = control();
  const expand = control();
  const collapse = control();
  const search = control();
  const session = control();
  const selectors = {
    "[data-module]": [module],
    "[data-tier-enable]": [tierEnable],
    "[data-tier-disable]": [tierDisable],
    "[data-category-enable]": [categoryEnable],
    "[data-category-disable]": [categoryDisable],
    ".category": [],
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
    querySelectorAll: (selector) => selectors[selector] || [],
  };
  bindPickerEvents({
    categories: {},
    required: new Set(),
    selected: new Set(),
    enabledModules: new Set(),
    owners: new Map(),
    boxes: [scope],
    sessionOptions: [session],
    moduleTier: () => {},
    enableModule: () => {},
    disableModule: () => {},
    render: () => {},
  });
  expect(
    [
      scope,
      session,
      module,
      tierEnable,
      tierDisable,
      categoryEnable,
      categoryDisable,
      allEnable,
      allDisable,
      expand,
      collapse,
      search,
    ].every((item) =>
      Object.values(item.handlers).every((handler) => typeof handler === "function"),
    ),
  ).toBe(true);
  expect(session.handlers.change).toEqual(expect.any(Function));
});
