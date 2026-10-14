import { validateExtensionManifest } from "../extensions.mjs";

export function loadExtensionSource({ sourcePath, fsImpl, fail }) {
  if (!sourcePath) {
    fail("Missing --path to an extension directory");
    return null;
  }
  const manifest = JSON.parse(fsImpl.readFileSync(`${sourcePath}/cf-extension.json`, "utf8"));
  if (!validateExtensionManifest(manifest)) {
    fail("Invalid cfhub extension manifest");
    return null;
  }
  return { source: sourcePath, manifest };
}
