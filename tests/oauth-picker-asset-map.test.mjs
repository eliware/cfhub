import { pickerAssetDefinition } from "../src/oauth-picker-asset-map.mjs";

test("maps picker text and image routes to their assets", () => {
  expect(pickerAssetDefinition("/oauth-picker.css")).toEqual({
    asset: "oauth-web/bundled/oauth-picker.css",
    contentType: "text/css; charset=utf-8",
    binary: false,
  });
  expect(pickerAssetDefinition("/oauth-web/cloudflare-115x53.png")).toEqual({
    asset: "oauth-web/cloudflare-115x53.png",
    contentType: "image/png",
    binary: true,
  });
  expect(pickerAssetDefinition("/missing")).toBeNull();
});
