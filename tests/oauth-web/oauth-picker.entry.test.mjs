import { jest } from "@jest/globals";
for (const stylesheet of [
  "picker-layout",
  "picker-module-controls",
  "picker-module-cards",
  "picker-scope-controls",
  "picker-scope-categories",
  "picker-scope-features",
  "picker-brand",
  "picker-brand-lockup",
  "picker-footer",
  "picker-quick-setup",
  "picker-faq",
])
  jest.unstable_mockModule(`../../src/oauth-web/styles/${stylesheet}.css`, () => ({}));
const { cssOnlyEntry } = await import("../../src/oauth-web/oauth-picker.entry.mjs");

test("picker entry is CSS only", () => {
  expect(cssOnlyEntry).toBe(true);
});
