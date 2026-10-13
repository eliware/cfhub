import { cssOnlyEntry } from "../../src/oauth-web/oauth-success.entry.mjs";
test("success entry is CSS only", () => {
  expect(cssOnlyEntry).toBe(true);
});
