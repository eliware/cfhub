import { jest } from "@jest/globals";
import { renderPickerModuleState } from "../../../../src/oauth-web/picker/render/module-state.mjs";

test("renders module buttons, category counts, and the module total", () => {
  const moduleButton = {
    dataset: { module: "zones" },
    classList: { toggle: jest.fn() },
    setAttribute: jest.fn(),
  };
  const categoryCount = { dataset: { categoryCount: "zones" }, textContent: "" };
  const moduleCount = { textContent: "" };
  globalThis.document = {
    querySelectorAll: (selector) =>
      selector === "[data-module]" ? [moduleButton] : [categoryCount],
  };
  renderPickerModuleState({
    categories: { zones: [{ scopes: [{ scope: "zone.read" }, { scope: "zone.write" }] }] },
    modules: [{ id: "zones" }, { id: "dns" }],
    state: { selected: new Set(["zone.read"]), enabledModules: new Set(["zones"]) },
    moduleCount,
  });
  expect(moduleButton.classList.toggle).toHaveBeenCalledWith("active", true);
  expect(moduleButton.setAttribute).toHaveBeenCalledWith("aria-pressed", "true");
  expect(categoryCount.textContent).toBe("1/2");
  expect(moduleCount.textContent).toBe("1/2 modules enabled");
});
