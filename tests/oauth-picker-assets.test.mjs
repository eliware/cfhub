import { pickerAsset, pickerAssetBuffer } from "../src/oauth-picker-assets.mjs";

test("loads picker assets in text and binary form", () => {
  expect(pickerAsset("oauth-web/cf-logo.svg")).toContain("svg");
  expect(pickerAssetBuffer("oauth-web/cloudflare-115x53.png")).toBeInstanceOf(Buffer);
  expect(pickerAssetBuffer("oauth-web/oauth-picker.html")).toBeInstanceOf(Buffer);
  expect(pickerAsset("oauth-web/oauth-picker.html")).toContain("<!doctype html>");
});
