import { jest } from "@jest/globals";
import { renderPickerModuleGroups } from "../../src/oauth-web/picker-module-groups.mjs";

test("renders module tiers and inserts catalog text as text", () => {
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
  const unsafeName = '<img src="x" onerror="run()">';
  const unsafeDescription = "<script>run()</script>";
  renderPickerModuleGroups(
    [
      { id: '" onfocus="run()', tier: "basic", name: unsafeName, description: unsafeDescription },
      { id: "extra", tier: "advanced", name: "Extra", description: "More" },
    ],
    { append },
  );
  expect(append).toHaveBeenCalledTimes(2);
  const [basic, advanced] = append.mock.calls.map(([group]) => group);
  expect(basic.innerHTML).toContain("Basic modules");
  expect(basic.innerHTML).not.toContain(unsafeName);
  expect(basic.innerHTML).not.toContain(unsafeDescription);
  expect(basic.list.children[0].dataset.module).toBe('" onfocus="run()');
  expect(basic.list.children[0].children[0].textContent).toBe(unsafeName);
  expect(basic.list.children[0].children[1].textContent).toBe(unsafeDescription);
  expect(advanced.innerHTML).toContain("Advanced modules");
  expect(advanced.list.children[0].children[0].textContent).toBe("Extra");
  expect(elements).toHaveLength(8);
});
