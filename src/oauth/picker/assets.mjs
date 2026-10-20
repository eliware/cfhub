import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const publicAssets = new Set([
  "oauth-web/cf-logo.svg",
  "oauth-web/cloudflare-115x53.png",
  "oauth-web/eliware-58x58.png",
]);
const builtAssets = new Map([
  ["oauth-web/bundled/oauth-picker.css", "oauth-picker.css"],
  ["oauth-web/bundled/oauth-result.css", "oauth-result.css"],
  ["oauth-web/bundled/oauth-success.css", "oauth-success.css"],
  ["oauth-web/oauth/picker-app.mjs", "oauth-picker.js"],
]);

function readSourceAsset(name, encoding) {
  const root = publicAssets.has(name) ? "../../../public/" : "../../";
  return readFileSync(fileURLToPath(new URL(`${root}${name}`, import.meta.url)), encoding);
}

function readBuiltAsset(name) {
  const builtName = builtAssets.get(name);
  if (!builtName) return null;
  try {
    const path = new URL(`../../../dist/${builtName}`, import.meta.url);
    return readFileSync(fileURLToPath(path), "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return null;
  }
}

export const pickerAsset = (name) => {
  return readBuiltAsset(name) ?? readSourceAsset(name, "utf8");
};
export const pickerAssetBuffer = (name) => readSourceAsset(name);
