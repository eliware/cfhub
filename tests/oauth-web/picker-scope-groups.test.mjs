import { jest } from "@jest/globals";
import { renderPickerScopeGroups } from "../../src/oauth-web/picker-scope-groups.mjs";

test("renders scope categories", () => {
  const category = { querySelectorAll: () => [] };
  globalThis.document = { createElement: jest.fn(() => category) };
  const append = jest.fn();
  renderPickerScopeGroups(
    { zone: [{ name: "Zones", scopes: [{ scope: "zone.read", label: "Read" }] }] },
    { append },
    [],
  );
  expect(category.innerHTML).toContain('data-category-enable="zone"');
  expect(append).toHaveBeenCalledWith(category);
});
