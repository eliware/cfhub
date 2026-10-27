import { jest } from "@jest/globals";

const showLists = jest.fn();
const showList = jest.fn();
jest.unstable_mockModule("../../../src/handlers/lists/list-view.mjs", () => ({ showLists }));
jest.unstable_mockModule("../../../src/handlers/lists/item-view.mjs", () => ({ showList }));
const { handleListsRead } = await import("../../../src/handlers/lists/read.mjs");

beforeEach(() => {
  showLists.mockReset();
  showList.mockReset();
});

test("routes list actions to the list view", () => {
  const input = { action: "list" };
  handleListsRead(input);
  expect(showLists).toHaveBeenCalledWith(input);
  expect(showList).not.toHaveBeenCalled();
});

test("routes other read actions to the item view", () => {
  const input = { action: "get" };
  handleListsRead(input);
  expect(showList).toHaveBeenCalledWith(input);
  expect(showLists).not.toHaveBeenCalled();
});
