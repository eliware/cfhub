import { pickerAsset, pickerAssetBuffer } from "./oauth-picker-assets.mjs";
import { sendAsset } from "./oauth-asset-response.mjs";
import { pickerAssetDefinition } from "./oauth-picker-asset-map.mjs";

export function serveOAuthPickerStaticAsset({ request, response, url, scopePicker }) {
  if (!scopePicker || request.method !== "GET") return false;
  const definition = pickerAssetDefinition(url.pathname);
  if (!definition) return false;
  const content = definition.binary
    ? pickerAssetBuffer(definition.asset)
    : pickerAsset(definition.asset);
  sendAsset(request, response, content, definition.contentType);
  return true;
}
