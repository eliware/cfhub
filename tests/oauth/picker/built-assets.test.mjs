import { beforeEach, jest } from "@jest/globals";

const readFileSync = jest.fn();
jest.unstable_mockModule("node:fs", () => ({ readFileSync }));
const { readBuiltPickerAsset } = await import("../../../src/oauth/picker/built-assets.mjs");

beforeEach(() => readFileSync.mockReset());

test("reads a mapped built asset", () => {
  readFileSync.mockReturnValue("built CSS");
  expect(readBuiltPickerAsset("oauth-web/bundled/oauth-picker.css")).toBe("built CSS");
  expect(readFileSync).toHaveBeenCalledWith(expect.stringContaining("dist"), "utf8");
});

test("returns null for an unmapped or missing built asset", () => {
  expect(readBuiltPickerAsset("oauth-web/unknown.css")).toBeNull();
  readFileSync.mockImplementationOnce(() => {
    throw Object.assign(new Error("missing build"), { code: "ENOENT" });
  });
  expect(readBuiltPickerAsset("oauth-web/bundled/oauth-picker.css")).toBeNull();
});

test("propagates built asset errors other than missing files", () => {
  const error = Object.assign(new Error("read failed"), { code: "EACCES" });
  readFileSync.mockImplementationOnce(() => {
    throw error;
  });
  expect(() => readBuiltPickerAsset("oauth-web/bundled/oauth-picker.css")).toThrow(error);
});
