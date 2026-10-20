import { pickerAsset, pickerAssetBuffer } from "./assets.mjs";
import { sendAsset } from "../asset/response.mjs";
import { pickerAssetDefinition } from "./asset-map.mjs";

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
