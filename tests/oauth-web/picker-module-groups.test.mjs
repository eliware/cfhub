import { jest } from "@jest/globals";
import { renderPickerModuleGroups } from "../../src/oauth-web/picker-module-groups.mjs";

test("renders each module tier and its modules", () => {
  const elements = [];
  globalThis.document = {
    createElement: jest.fn(() => {
      const item = {};
      elements.push(item);
      return item;
    }),
  };
  const append = jest.fn();
  renderPickerModuleGroups(
    [
      { id: "core", tier: "basic", name: "Core", description: "Base" },
      { id: "extra", tier: "advanced", name: "Extra", description: "More" },
    ],
    { append },
  );
  expect(append).toHaveBeenCalledTimes(2);
  expect(elements[0].innerHTML).toContain("Base");
  expect(elements[0].innerHTML).not.toContain("More");
  expect(elements[1].innerHTML).toContain("Extra");
});
