import { extensionPathsOverlap } from "../../../src/handlers/extension/path-policy.mjs";

test("detects equal, nested, and separate extension paths", () => {
  expect(extensionPathsOverlap("C:/extensions/demo", "C:/extensions/demo")).toBe(true);
  expect(extensionPathsOverlap("C:/extensions/demo/source", "C:/extensions/demo")).toBe(true);
  expect(extensionPathsOverlap("C:/source", "C:/extensions/demo")).toBe(false);
});

test("uses absolute paths when real path resolution is unavailable or fails", () => {
  expect(extensionPathsOverlap("C:/source", "C:/extensions/demo", {})).toBe(false);
  expect(
    extensionPathsOverlap("C:/source", "C:/extensions/demo", {
      realpathSync: () => {
        throw new Error("path is not linked");
      },
    }),
  ).toBe(false);
});

test("detects overlap after resolving a source link", () => {
  expect(
    extensionPathsOverlap("C:/source-link", "C:/extensions/demo", {
      realpathSync: (value) =>
        value.endsWith("source-link")
          ? value.replace("source-link", "extensions/demo/source")
          : value,
    }),
  ).toBe(true);
});
