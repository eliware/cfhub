import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/oauth-web/oauth-result.css", () => ({}));
const { cssOnlyEntry } = await import("../../src/oauth-web/oauth-result.entry.mjs");

test("result entry is CSS only", () => {
  expect(cssOnlyEntry).toBe(true);
});
