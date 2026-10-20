import { jest } from "@jest/globals";
import { createPickerModuleTier } from "../../../../src/oauth-web/picker/module/tier-groups.mjs";

test("creates a tier with its controls and module list", () => {
  const list = {};
  const group = {
    querySelector: jest.fn(() => list),
  };
  globalThis.document = { createElement: jest.fn(() => group) };

  expect(createPickerModuleTier("basic", "Basic modules")).toEqual({ group, list });
  expect(document.createElement).toHaveBeenCalledWith("div");
  expect(group.className).toBe("module-tier");
  expect(group.innerHTML).toContain("Basic modules");
  expect(group.innerHTML).toContain('data-tier-enable="basic"');
  expect(group.innerHTML).toContain('data-tier-disable="basic"');
  expect(group.querySelector).toHaveBeenCalledWith(".module-list");
});
