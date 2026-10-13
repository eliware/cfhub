import { cssOnlyEntry } from "../../src/oauth-web/oauth-picker.entry.mjs";
test("picker entry is CSS only", () => {
  expect(cssOnlyEntry).toBe(true);
});
