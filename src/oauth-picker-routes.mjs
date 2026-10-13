import { pickerHtml } from "./oauth-picker-page.mjs";
import { sendAsset } from "./oauth-asset-response.mjs";
import { serveOAuthPickerVersionRoute } from "./oauth-picker-version-route.mjs";
import { serveOAuthPickerStaticAsset } from "./oauth-picker-static-assets.mjs";
import { serveOAuthPickerSubmitRoute } from "./oauth-picker-submit-route.mjs";

export function serveOAuthPickerRoute(options) {
  const { request, response, url, scopePicker } = options;
  if (serveOAuthPickerVersionRoute(options)) return true;
  if (scopePicker && url.pathname === "/" && request.method === "GET") {
    sendAsset(request, response, pickerHtml(), "text/html; charset=utf-8", {
      cacheControl: "no-store",
    });
    return true;
  }
  if (serveOAuthPickerStaticAsset(options)) return true;
  return serveOAuthPickerSubmitRoute(options);
}
