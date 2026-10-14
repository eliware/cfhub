import { jest } from "@jest/globals";
import { createPickerModuleCard } from "../../src/oauth-web/picker-module-card.mjs";

test("creates a module button and inserts catalog content as text", () => {
  const elements = [];
  const documentRef = {
    createElement: jest.fn((tag) => {
      const element = {
        tag,
        dataset: {},
        children: [],
        append(...items) {
          this.children.push(...items);
        },
      };
      elements.push(element);
      return element;
    }),
  };
  const module = {
    id: '" onfocus="run()',
    name: '<img src="x" onerror="run()">',
    description: "<script>run()</script>",
  };

  const button = createPickerModuleCard(module, documentRef);

  expect(button.tag).toBe("button");
  expect(button.type).toBe("button");
  expect(button.className).toBe("module");
  expect(button.dataset.module).toBe(module.id);
  expect(button.children[0]).toMatchObject({ tag: "strong", textContent: module.name });
  expect(button.children[1]).toMatchObject({ tag: "small", textContent: module.description });
  expect(elements).toHaveLength(3);
});
