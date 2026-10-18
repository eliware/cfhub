const utf8ContentType = (mediaType) => `${mediaType}${String.fromCharCode(59)} charset=utf-8`;

const textAssets = {
  "/oauth-picker.css": ["oauth-web/bundled/oauth-picker.css", utf8ContentType("text/css")],
  "/oauth-picker.mjs": ["oauth-web/oauth/picker.mjs", utf8ContentType("text/javascript")],
  "/oauth-picker-app.mjs": ["oauth-web/oauth/picker-app.mjs", utf8ContentType("text/javascript")],
  "/picker-groups.mjs": ["oauth-web/picker/groups.mjs", utf8ContentType("text/javascript")],
  "/picker-events.mjs": ["oauth-web/picker/events.mjs", utf8ContentType("text/javascript")],
  "/picker-state.mjs": ["oauth-web/picker/state.mjs", utf8ContentType("text/javascript")],
  "/picker-navigation.mjs": ["oauth-web/picker/navigation.mjs", utf8ContentType("text/javascript")],
  "/oauth-web/cf-logo.svg": ["oauth-web/cf-logo.svg", "image/svg+xml"],
  "/oauth-result.css": ["oauth-web/bundled/oauth-result.css", utf8ContentType("text/css")],
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
