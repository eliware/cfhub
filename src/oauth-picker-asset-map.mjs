const textAssets = {
  "/oauth-picker.css": ["oauth-web/bundled/oauth-picker.css", "text/css; charset=utf-8"],
  "/oauth-picker.mjs": ["oauth-web/oauth-picker.mjs", "text/javascript; charset=utf-8"],
  "/picker-groups.mjs": ["oauth-web/picker-groups.mjs", "text/javascript; charset=utf-8"],
  "/picker-events.mjs": ["oauth-web/picker-events.mjs", "text/javascript; charset=utf-8"],
  "/picker-state.mjs": ["oauth-web/picker-state.mjs", "text/javascript; charset=utf-8"],
  "/picker-navigation.mjs": ["oauth-web/picker-navigation.mjs", "text/javascript; charset=utf-8"],
  "/oauth-web/cf-logo.svg": ["oauth-web/cf-logo.svg", "image/svg+xml"],
  "/oauth-result.css": ["oauth-web/bundled/oauth-result.css", "text/css; charset=utf-8"],
};
const imageAssets = {
  "/oauth-web/cloudflare-115x53.png": "cloudflare-115x53.png",
  "/oauth-web/eliware-58x58.png": "eliware-58x58.png",
};

export function pickerAssetDefinition(pathname) {
  if (textAssets[pathname]) {
    const [asset, contentType] = textAssets[pathname];
    return { asset, contentType, binary: false };
  }
  if (imageAssets[pathname]) {
    return { asset: `oauth-web/${imageAssets[pathname]}`, contentType: "image/png", binary: true };
  }
  return null;
}
