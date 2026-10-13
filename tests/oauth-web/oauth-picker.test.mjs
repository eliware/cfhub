import { jest } from "@jest/globals";
import { initializePicker as exportedPicker } from "../../src/oauth-web/oauth-picker.mjs";

test("picker initializes groups and updates controls from selection state", async () => {
  const state = {
    selected: new Set(["zone.read"]),
    required: new Set(["zone.read"]),
    enabledModules: new Set(),
  };
  const modules = [
    { id: "zones", scopes: ["zone.read"] },
    { id: "dns", scopes: ["dns.read"] },
  ];
  const renderGroups = jest.fn(({ boxes }) =>
    boxes.push({ value: "zone.read" }, { value: "dns.read" }),
  );
  let render;
  const bindEvents = jest.fn((options) => {
    render = options.render;
  });
  await jest.unstable_mockModule("../../src/oauth-web/picker-groups.mjs", () => ({
    renderPickerGroups: renderGroups,
  }));
  await jest.unstable_mockModule("../../src/oauth-web/picker-events.mjs", () => ({
    bindPickerEvents: bindEvents,
  }));
  await jest.unstable_mockModule("../../src/oauth-web/picker-state.mjs", () => ({
    createPickerState: () => state,
  }));
  const quickSetup = {};
  const moduleCount = {};
  const scopeCount = {};
  const login = { setAttribute: jest.fn() };
  const hint = {};
  const moduleButtons = modules.map(({ id }) => ({
    dataset: { module: id },
    classList: { toggle: jest.fn() },
    setAttribute: jest.fn(),
  }));
  const categoryCount = { dataset: { categoryCount: "zones" } };
  const document = {
    querySelector: (selector) =>
      ({ ".quick-setup": quickSetup, "#module-count": moduleCount, "#scope-count": scopeCount })[
        selector
      ],
    querySelectorAll: (selector) =>
      ({
        'input[name="keep-signed-in"]': [],
        "[data-module]": moduleButtons,
        "[data-category-count]": [categoryCount],
        ".login": [login],
        ".login-hint": [hint],
      })[selector] || [],
  };
  globalThis.window = {
    CFHUB_SCOPE_MODEL: {
      categories: { zones: [{ scopes: [{ scope: "zone.read" }, { scope: "dns.read" }] }] },
      modules,
    },
    matchMedia: () => ({ matches: true }),
  };
  globalThis.document = document;
  const { initializePicker } = await import(
    `../../src/oauth-web/oauth-picker.mjs?test=${Date.now()}`
  );
  expect(quickSetup.open).toBe(false);
  expect(renderGroups).toHaveBeenCalledTimes(1);
  expect(bindEvents).toHaveBeenCalledTimes(1);
  render();
  expect(scopeCount.textContent).toBe(1);
  expect(moduleCount.textContent).toBe("1/2 modules enabled");
  expect(login.disabled).toBe(false);
  expect(hint.hidden).toBe(true);
  expect(categoryCount.textContent).toBe("1/2");
  state.selected.clear();
  render(false);
  expect(login.disabled).toBe(true);
  expect(login.setAttribute).toHaveBeenCalledWith("aria-disabled", "true");
  expect(hint.hidden).toBe(false);
  expect(initializePicker).toEqual(expect.any(Function));
  expect(exportedPicker).toEqual(expect.any(Function));
  globalThis.window.matchMedia = () => ({ matches: false });
  initializePicker();
  expect(quickSetup.open).toBe(false);
});
