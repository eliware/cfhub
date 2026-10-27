import { validateExtensionManifest } from "../../extensions.mjs";

export function readExtensionManifest(sourcePath, fsImpl, fail) {
  let manifest;
  try {
    manifest = JSON.parse(fsImpl.readFileSync(`${sourcePath}/cf-extension.json`, "utf8"));
  } catch {
    fail("Invalid cfhub extension manifest");
    return null;
  }
  if (!validateExtensionManifest(manifest)) {
    fail("Invalid cfhub extension manifest");
    return null;
  }
  return manifest;
}
