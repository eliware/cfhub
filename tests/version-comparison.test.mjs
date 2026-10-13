import { newerVersion } from "../src/version-comparison.mjs";

test("compares version parts in order", () => {
  expect(newerVersion("2.0.0", "1.9.9")).toBe(true);
  expect(newerVersion("1.2.1", "1.2.0")).toBe(true);
  expect(newerVersion("1.2.0", "1.2.0")).toBe(false);
  expect(newerVersion("1.1.9", "1.2.0")).toBe(false);
});
