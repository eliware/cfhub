import { VERSION } from "../src/version.mjs";
test("version is a semantic version", () => {
  expect(VERSION).toMatch(/^\d+\.\d+\.\d+/);
});
