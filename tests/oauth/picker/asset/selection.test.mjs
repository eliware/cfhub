import { beforeEach, jest } from "@jest/globals";

const readFileSync = jest.fn();
jest.unstable_mockModule("node:fs", () => ({ readFileSync }));
const { pickerAsset } = await import("../../../../src/oauth/picker/asset/selection.mjs");

beforeEach(() => readFileSync.mockReset());

test("falls back to a source asset when the built asset is missing", () => {
  readFileSync
    .mockImplementationOnce(() => {
      throw Object.assign(new Error("missing build"), { code: "ENOENT" });
    })
    .mockReturnValueOnce("source CSS");
  expect(pickerAsset("oauth-web/bundled/oauth-picker.css")).toBe("source CSS");
  expect(readFileSync).toHaveBeenLastCalledWith(expect.stringContaining("src"), "utf8");
});
