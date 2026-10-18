import { jest } from "@jest/globals";
jest.unstable_mockModule("../../../src/oauth-web/oauth-success.css", () => ({}));
const { cssOnlyEntry } = await import("../../../src/oauth-web/oauth/success.entry.mjs");

test("success entry is CSS only", () => {
  expect(cssOnlyEntry).toBe(true);
});
