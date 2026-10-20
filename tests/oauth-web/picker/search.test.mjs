import { filterPickerCategories } from "../../../src/oauth-web/picker/search.mjs";

test("filters categories without case sensitivity", () => {
  const categories = [
    { textContent: "Zone settings", open: false },
    { textContent: "DNS records", open: false },
  ];
  filterPickerCategories(categories, "ZONE");
  expect(categories.map(({ hidden }) => hidden)).toEqual([false, true]);
  expect(categories[0].open).toBe(true);
});

test("shows all categories when the search is empty", () => {
  const categories = [{ textContent: "Zone settings", hidden: true, open: false }];
  filterPickerCategories(categories, "");
  expect(categories[0].hidden).toBe(false);
  expect(categories[0].open).toBe(false);
});
