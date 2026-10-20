import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { pickerAssetDefinition } from "./asset-map.mjs";

export function readSourcePickerAsset(name, encoding) {
  const definition = pickerAssetDefinition(`/${name}`);
  const root = definition?.public ? "../../../public/" : "../../";
  return readFileSync(fileURLToPath(new URL(`${root}${name}`, import.meta.url)), encoding);
}
