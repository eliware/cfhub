import { jest } from "@jest/globals";
import { collectPickerScopeBoxes } from "../../src/oauth-web/collect-picker-scope-boxes.mjs";

test("collects scope checkbox elements from a category", () => {
  const boxes = [{ checked: true }, { checked: false }];
  const querySelectorAll = jest.fn(() => boxes);
  expect(collectPickerScopeBoxes({ querySelectorAll })).toEqual(boxes);
  expect(querySelectorAll).toHaveBeenCalledWith("[data-scope]");
});
