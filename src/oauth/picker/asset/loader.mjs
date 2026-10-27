import { pickerAsset } from "./selection.mjs";
import { pickerAssetDefinition } from "./map.mjs";
import { pickerAssetBuffer } from "./source-buffer.mjs";

export function loadOAuthPickerAsset(pathname) {
  const definition = pickerAssetDefinition(pathname);
  if (!definition) return null;
  const content = definition.binary
    ? pickerAssetBuffer(definition.asset)
    : pickerAsset(definition.asset);
  return { content, contentType: definition.contentType };
}
