import { jest } from "@jest/globals";
import { renderPickerScopeGroups } from "../../src/oauth-web/picker-scope-groups.mjs";

test("renders scope categories and collects checkboxes", () => {
  const category = { querySelectorAll: () => ["checkbox"] };
  globalThis.document = { createElement: jest.fn(() => category) };
  const append = jest.fn();
  const boxes = [];
  renderPickerScopeGroups(
    { zone: [{ name: "Zones", scopes: [{ scope: "zone.read", label: "Read" }] }] },
    { append },
    boxes,
  );
  expect(category.innerHTML).toContain('data-category-enable="zone"');
  expect(append).toHaveBeenCalledWith(category);
  expect(boxes).toEqual(["checkbox"]);
});
