import { beforeEach, jest } from "@jest/globals";

const readFileSync = jest.fn();
jest.unstable_mockModule("node:fs", () => ({ readFileSync }));
const { loadOAuthPickerAsset } = await import("../../../../src/oauth/picker/asset/loader.mjs");

beforeEach(() => readFileSync.mockReset());

test("loads a text asset and its content type", () => {
  readFileSync.mockReturnValueOnce("built CSS");
  expect(loadOAuthPickerAsset("/oauth-picker.css")).toMatchObject({
    content: "built CSS",
    contentType: expect.stringContaining("text/css"),
  });
});

test("loads a binary asset and its content type", () => {
  const image = Buffer.from("image");
  readFileSync.mockReturnValueOnce(image);
  expect(loadOAuthPickerAsset("/oauth-web/cloudflare-115x53.png")).toEqual({
    content: image,
    contentType: "image/png",
  });
});

test("returns null for an unmapped asset path", () => {
  expect(loadOAuthPickerAsset("/unknown.css")).toBeNull();
});
