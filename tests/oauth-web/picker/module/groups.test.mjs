import { jest } from "@jest/globals";
import { renderPickerModuleGroups } from "../../../../src/oauth-web/picker/module/groups.mjs";

test("renders modules in basic and advanced tiers", () => {
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
        append(...items) {
          this.children.push(...items);
        },
        querySelector: () => list,
        list,
      };
      elements.push(element);
      return element;
    }),
  };
  const append = jest.fn();
  renderPickerModuleGroups(
    [
      { id: "zones", tier: "basic", name: "Zones", description: "Manage zones" },
      { id: "extra", tier: "advanced", name: "Extra", description: "More" },
    ],
    { append },
  );
  expect(append).toHaveBeenCalledTimes(2);
  const [basic, advanced] = append.mock.calls.map(([group]) => group);
  expect(basic.innerHTML).toContain("Basic modules");
  expect(basic.list.children).toHaveLength(1);
  expect(basic.list.children[0].dataset.module).toBe("zones");
  expect(advanced.innerHTML).toContain("Advanced modules");
  expect(advanced.list.children).toHaveLength(1);
  expect(advanced.list.children[0].dataset.module).toBe("extra");
  expect(elements).toHaveLength(8);
});
