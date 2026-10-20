import { beforeEach, jest } from "@jest/globals";

const readFileSync = jest.fn();
jest.unstable_mockModule("node:fs", () => ({ readFileSync }));
const { pickerAsset, pickerAssetBuffer } = await import("../../../src/oauth/picker/assets.mjs");

beforeEach(() => readFileSync.mockReset());

test("falls back to a source asset through the asset facade", () => {
  readFileSync
    .mockImplementationOnce(() => {
      throw Object.assign(new Error("missing build"), { code: "ENOENT" });
    })
    .mockReturnValueOnce("source CSS");
  expect(pickerAsset("oauth-web/bundled/oauth-picker.css")).toBe("source CSS");
  expect(readFileSync).toHaveBeenLastCalledWith(expect.stringContaining("src"), "utf8");
});

test("reads a binary asset through the asset facade", () => {
  const image = Buffer.from("image");
  readFileSync.mockReturnValueOnce(image);
  expect(pickerAssetBuffer("oauth-web/cloudflare-115x53.png")).toBe(image);
});
