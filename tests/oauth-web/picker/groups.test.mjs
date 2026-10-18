import { jest } from "@jest/globals";
import { renderPickerGroups } from "../../../src/oauth-web/picker/groups.mjs";

test("picker group renderer creates module tiers and scope categories", () => {
  const checkboxes = [{ value: "zone.read" }, { value: "zone.write" }];
  const elements = [];
  globalThis.document = {
    createElement: jest.fn((tag) => {
      const list = {
        children: [],
        append(item) {
          this.children.push(item);
        },
      };
      const element = {
        tag,
        dataset: {},
        children: [],
        list,
        querySelector: () => list,
        querySelectorAll: () => checkboxes,
        append(...items) {
          this.children.push(...items);
        },
      };
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
  const tiers = moduleGroups.append.mock.calls.map(([group]) => group);
  expect(tiers[0].list.children[0].children[1].textContent).toBe("Core access");
  expect(tiers[0].list.children[0].children[1].textContent).not.toBe("Extra access");
  expect(tiers[1].list.children[0].children[1].textContent).toBe("Extra access");
  expect(scopeGroups.append).toHaveBeenCalledTimes(2);
  expect(scopeGroups.append.mock.calls[0][0].innerHTML).toContain("Zone");
  expect(scopeGroups.append.mock.calls[1][0].innerHTML).toContain("DNS");
  expect(boxes).toEqual(checkboxes.concat(checkboxes));
});
