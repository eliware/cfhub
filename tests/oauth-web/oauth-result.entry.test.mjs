import { cssOnlyEntry } from "../../src/oauth-web/oauth-result.entry.mjs";
test("result entry is CSS only", () => {
  expect(cssOnlyEntry).toBe(true);
});
