import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const publicAssets = new Set([
  "oauth-web/cf-logo.svg",
  "oauth-web/cloudflare-115x53.png",
  "oauth-web/eliware-58x58.png",
]);
export const pickerAsset = (name) => {
  const root = publicAssets.has(name) ? "../../../public/" : "../../";
  return readFileSync(fileURLToPath(new URL(`${root}${name}`, import.meta.url)), "utf8");
};
export const pickerAssetBuffer = (name) => {
  const root = publicAssets.has(name) ? "../../../public/" : "../../";
  return readFileSync(fileURLToPath(new URL(`${root}${name}`, import.meta.url)));
};
