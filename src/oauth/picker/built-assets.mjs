import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const builtAssets = new Map([
  ["oauth-web/bundled/oauth-picker.css", "oauth-picker.css"],
  ["oauth-web/bundled/oauth-result.css", "oauth-result.css"],
  ["oauth-web/bundled/oauth-success.css", "oauth-success.css"],
  ["oauth-web/oauth/picker-app.mjs", "oauth-picker.js"],
]);

export function readBuiltPickerAsset(name) {
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
