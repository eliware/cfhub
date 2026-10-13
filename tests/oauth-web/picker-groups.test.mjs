import { jest } from "@jest/globals";
import { renderPickerGroups } from "../../src/oauth-web/picker-groups.mjs";

test("picker group renderer creates module tiers and scope categories", () => {
  const checkboxes = [{ value: "zone.read" }, { value: "zone.write" }];
  const elements = [];
  globalThis.document = {
    createElement: jest.fn((tag) => {
      const element = { tag, querySelectorAll: () => checkboxes };
      elements.push(element);
      return element;
    }),
  };
  const moduleGroups = { append: jest.fn() };
  const scopeGroups = { append: jest.fn() };
  const boxes = [];
  renderPickerGroups({
    modules: [
      { id: "core", tier: "basic", name: "Core", description: "Core access" },
      { id: "extra", tier: "advanced", name: "Extra", description: "Extra access" },
    ],
    categories: {
      zones: [{ name: "Zone", scopes: [{ scope: "zone.read", label: "Read" }] }],
      dns: [{ name: "DNS", scopes: [{ scope: "zone.write", label: "Write" }] }],
    },
    moduleGroups,
    scopeGroups,
    boxes,
  });
  expect(moduleGroups.append).toHaveBeenCalledTimes(2);
  expect(elements[0].innerHTML).toContain("Core access");
  expect(elements[0].innerHTML).not.toContain("Extra access");
  expect(elements[1].innerHTML).toContain("Extra access");
  expect(scopeGroups.append).toHaveBeenCalledTimes(2);
  expect(elements[2].innerHTML).toContain("Zone");
  expect(elements[3].innerHTML).toContain("DNS");
  expect(boxes).toEqual(checkboxes.concat(checkboxes));
});
