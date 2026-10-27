import { sendAsset } from "../asset/response.mjs";
import { loadOAuthPickerAsset } from "./asset/loader.mjs";

export function serveOAuthPickerStaticAsset({ request, response, url, scopePicker }) {
  if (!scopePicker || request.method !== "GET") return false;
  const asset = loadOAuthPickerAsset(url.pathname);
  if (!asset) return false;
  sendAsset(request, response, asset.content, asset.contentType);
  return true;
}
