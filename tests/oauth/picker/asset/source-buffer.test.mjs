import { beforeEach, jest } from "@jest/globals";

const readFileSync = jest.fn();
jest.unstable_mockModule("node:fs", () => ({ readFileSync }));
const { pickerAssetBuffer } = await import("../../../../src/oauth/picker/asset/source-buffer.mjs");

beforeEach(() => readFileSync.mockReset());

test("reads a binary asset from the source tree", () => {
  const image = Buffer.from("image");
  readFileSync.mockReturnValueOnce(image);
  expect(pickerAssetBuffer("oauth-web/cloudflare-115x53.png")).toBe(image);
});
