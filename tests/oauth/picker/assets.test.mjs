import { beforeEach, jest } from "@jest/globals";

const readFileSync = jest.fn();
jest.unstable_mockModule("node:fs", () => ({ readFileSync }));
const { pickerAsset, pickerAssetBuffer } = await import("../../../src/oauth/picker/assets.mjs");

beforeEach(() => readFileSync.mockReset());

test("serves built CSS when the webpack asset exists", () => {
  readFileSync.mockReturnValueOnce("built CSS");
  expect(pickerAsset("oauth-web/bundled/oauth-picker.css")).toBe("built CSS");
  expect(readFileSync).toHaveBeenCalledWith(expect.stringContaining("dist"), "utf8");
});

test("uses source assets when a built CSS file does not exist", () => {
  readFileSync
    .mockImplementationOnce(() => {
      throw Object.assign(new Error("missing build"), { code: "ENOENT" });
    })
    .mockReturnValueOnce("source CSS");
  expect(pickerAsset("oauth-web/bundled/oauth-picker.css")).toBe("source CSS");
  expect(readFileSync).toHaveBeenLastCalledWith(expect.stringContaining("src"), "utf8");
});

test("reads public text assets and binary assets from their source paths", () => {
  readFileSync.mockReturnValueOnce("logo").mockReturnValueOnce(Buffer.from("image"));
  expect(pickerAsset("oauth-web/cf-logo.svg")).toBe("logo");
  expect(pickerAssetBuffer("oauth-web/cloudflare-115x53.png")).toEqual(Buffer.from("image"));
  expect(readFileSync.mock.calls[0][0]).toContain("public");
  expect(readFileSync.mock.calls[1][0]).toContain("public");
});

test("propagates built asset errors other than missing files", () => {
  const error = Object.assign(new Error("read failed"), { code: "EACCES" });
  readFileSync.mockImplementationOnce(() => {
    throw error;
  });
  expect(() => pickerAsset("oauth-web/bundled/oauth-picker.css")).toThrow(error);
});
