const utf8ContentType = (mediaType) => `${mediaType}${String.fromCharCode(59)} charset=utf-8`;

const textAssets = {
  "/oauth-picker.css": ["oauth-web/bundled/oauth-picker.css", utf8ContentType("text/css")],
  "/oauth-picker.mjs": ["oauth-web/oauth/picker.mjs", utf8ContentType("text/javascript")],
  "/oauth-picker-app.mjs": ["oauth-web/oauth/picker-app.mjs", utf8ContentType("text/javascript")],
  "/picker.mjs": ["oauth-web/oauth/picker.mjs", utf8ContentType("text/javascript")],
  "/escape-picker-markup.mjs": [
    "oauth-web/escape-picker-markup.mjs",
    utf8ContentType("text/javascript"),
  ],
  "/collect-picker-scope-boxes.mjs": [
    "oauth-web/collect-picker-scope-boxes.mjs",
    utf8ContentType("text/javascript"),
  ],
  "/oauth-web/cf-logo.svg": ["oauth-web/cf-logo.svg", "image/svg+xml", true],
  "/oauth-result.css": ["oauth-web/bundled/oauth-result.css", utf8ContentType("text/css")],
};
const imageAssets = {
  "/oauth-web/cloudflare-115x53.png": "cloudflare-115x53.png",
  "/oauth-web/eliware-58x58.png": "eliware-58x58.png",
};

export function pickerAssetDefinition(pathname) {
  if (textAssets[pathname]) {
    const [asset, contentType, publicAsset = false] = textAssets[pathname];
    return { asset, contentType, binary: false, ...(publicAsset ? { public: true } : {}) };
  }
  if (/^\/picker\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.mjs$/.test(pathname))
    return {
      asset: `oauth-web${pathname}`,
      contentType: utf8ContentType("text/javascript"),
      binary: false,
    };
  if (imageAssets[pathname]) {
    return {
      asset: `oauth-web/${imageAssets[pathname]}`,
      contentType: "image/png",
      binary: true,
      public: true,
    };
  }
  return null;
}
