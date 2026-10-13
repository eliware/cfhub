import { jest } from "@jest/globals";
import { renderPickerState } from "../../src/oauth-web/picker-render.mjs";

test("renders scope, module, login, and category state", () => {
  const scopeCount = {};
  const login = { setAttribute: jest.fn() };
  const hint = {};
  const button = {
    dataset: { module: "zone" },
    classList: { toggle: jest.fn() },
    setAttribute: jest.fn(),
  };
  const counter = { dataset: { categoryCount: "zones" } };
  const moduleCount = {};
  globalThis.document = {
    querySelector: () => scopeCount,
    querySelectorAll: (selector) =>
      ({
        ".login": [login],
        ".login-hint": [hint],
        "[data-module]": [button],
        "[data-category-count]": [counter],
      })[selector],
  };
  const state = {
    selected: new Set(["zone.read"]),
    required: new Set(["zone.read"]),
    enabledModules: new Set(),
  };
  const modules = [{ id: "zone", scopes: ["zone.read"] }];
  const box = { value: "zone.read" };
  renderPickerState({
    categories: { zones: [{ scopes: [{ scope: "zone.read" }] }] },
    modules,
    state,
    boxes: [box],
    moduleCount,
  });
  expect(box).toMatchObject({ checked: true, disabled: true });
  expect(scopeCount.textContent).toBe(1);
  expect(counter.textContent).toBe("1/1");
  expect(moduleCount.textContent).toBe("1/1 modules enabled");
  expect(button.classList.toggle).toHaveBeenCalledWith("active", true);
  state.selected.clear();
  renderPickerState({
    categories: { zones: [{ scopes: [{ scope: "zone.read" }] }] },
    modules,
    state,
    boxes: [box],
    moduleCount,
    syncModules: false,
  });
  expect(login.disabled).toBe(true);
  expect(hint.hidden).toBe(false);
});
