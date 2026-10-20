import { sendAsset } from "../asset/response.mjs";
import { pickerHtml } from "./page.mjs";

const htmlContentType = `text/html${String.fromCharCode(59)} charset=utf-8`;

export function serveOAuthPickerLandingRoute({ request, response, url, scopePicker }) {
  if (!scopePicker || url.pathname !== "/" || request.method !== "GET") return false;
  sendAsset(request, response, pickerHtml(), htmlContentType, {
    cacheControl: "no-store",
  });
  return true;
}
