import path from "node:path";
import { validateExtensionManifest } from "../../extensions.mjs";
import { hasExtensionCommandFiles } from "./command-files.mjs";

export function loadExtensionSource({ sourcePath, fsImpl, fail }) {
  if (!sourcePath) {
    fail("Missing --path to an extension directory");
    return null;
  }
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
  const source = path.resolve(sourcePath);
  if (!hasExtensionCommandFiles(source, manifest.commands, fsImpl)) {
    fail("Invalid cfhub extension manifest");
    return null;
  }
  return { source: sourcePath, manifest };
}
