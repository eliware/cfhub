import path from "node:path";
import { hasExtensionCommandFiles } from "./command-files.mjs";
import { readExtensionManifest } from "./manifest-reader.mjs";

export function loadExtensionSource({ sourcePath, fsImpl, fail }) {
  if (!sourcePath) {
    fail("Missing --path to an extension directory");
    return null;
  }
  const manifest = readExtensionManifest(sourcePath, fsImpl, fail);
  if (!manifest) return null;
  const source = path.resolve(sourcePath);
  if (!hasExtensionCommandFiles(source, manifest.commands, fsImpl)) {
    fail("Invalid cfhub extension manifest");
    return null;
  }
  return { source: sourcePath, manifest };
}
