import { pickerAsset, pickerAssetBuffer } from "./oauth-picker-assets.mjs";
import { sendAsset } from "./oauth-asset-response.mjs";

const assets = {
  "/oauth-picker.css": ["oauth-web/bundled/oauth-picker.css", "text/css; charset=utf-8"],
  "/oauth-picker.mjs": ["oauth-web/oauth-picker.mjs", "text/javascript; charset=utf-8"],
  "/picker-groups.mjs": ["oauth-web/picker-groups.mjs", "text/javascript; charset=utf-8"],
  "/picker-events.mjs": ["oauth-web/picker-events.mjs", "text/javascript; charset=utf-8"],
  "/picker-state.mjs": ["oauth-web/picker-state.mjs", "text/javascript; charset=utf-8"],
  "/picker-navigation.mjs": ["oauth-web/picker-navigation.mjs", "text/javascript; charset=utf-8"],
  "/oauth-web/cf-logo.svg": ["oauth-web/cf-logo.svg", "image/svg+xml"],
  "/oauth-result.css": ["oauth-web/bundled/oauth-result.css", "text/css; charset=utf-8"],
};
const images = {
  "/oauth-web/cloudflare-115x53.png": "cloudflare-115x53.png",
  "/oauth-web/eliware-58x58.png": "eliware-58x58.png",
};

export function serveOAuthPickerStaticAsset({ request, response, url, scopePicker }) {
  if (scopePicker && request.method === "GET" && assets[url.pathname]) {
    const [asset, type] = assets[url.pathname];
    sendAsset(request, response, pickerAsset(asset), type);
    return true;
  }
  if (scopePicker && request.method === "GET" && images[url.pathname]) {
    sendAsset(
      request,
      response,
      pickerAssetBuffer(`oauth-web/${images[url.pathname]}`),
      "image/png",
    );
    return true;
  }
  return false;
}
