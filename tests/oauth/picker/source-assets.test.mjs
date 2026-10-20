import { beforeEach, jest } from "@jest/globals";

const readFileSync = jest.fn();
jest.unstable_mockModule("node:fs", () => ({ readFileSync }));
const { readSourcePickerAsset } = await import("../../../src/oauth/picker/source-assets.mjs");

beforeEach(() => readFileSync.mockReset());

test("reads public and source assets from their matching roots", () => {
  readFileSync.mockReturnValueOnce("logo").mockReturnValueOnce("picker source");
  expect(readSourcePickerAsset("oauth-web/cf-logo.svg", "utf8")).toBe("logo");
  expect(readSourcePickerAsset("oauth-web/oauth-picker.html", "utf8")).toBe("picker source");
  expect(readFileSync.mock.calls[0][0]).toContain("public");
  expect(readFileSync.mock.calls[1][0]).toContain("src");
});

test("reads public image assets without text encoding", () => {
  const image = Buffer.from("image");
  readFileSync.mockReturnValue(image);
  expect(readSourcePickerAsset("oauth-web/cloudflare-115x53.png")).toBe(image);
  expect(readFileSync).toHaveBeenCalledWith(expect.stringContaining("public"), undefined);
});
