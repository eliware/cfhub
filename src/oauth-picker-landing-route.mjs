import { sendAsset } from "./oauth-asset-response.mjs";
import { pickerHtml } from "./oauth-picker-page.mjs";

export function serveOAuthPickerLandingRoute({ request, response, url, scopePicker }) {
  if (!scopePicker || url.pathname !== "/" || request.method !== "GET") return false;
  sendAsset(request, response, pickerHtml(), "text/html; charset=utf-8", {
    cacheControl: "no-store",
  });
  return true;
}
