import path from "node:path";
import { hasExtensionCommandFiles } from "./command-files.mjs";
import { readExtensionManifest } from "./manifest-reader.mjs";
import { hasNoExtensionSymlinks } from "./source-symlinks.mjs";

export function loadExtensionSource({ sourcePath, fsImpl, fail }) {
  if (!sourcePath) {
    fail("Missing --path to an extension directory");
    return null;
  }
  const manifest = readExtensionManifest(sourcePath, fsImpl, fail);
  if (!manifest) return null;
  const source = path.resolve(sourcePath);
  if (!hasNoExtensionSymlinks(source, fsImpl)) {
    fail("Extension source cannot contain symbolic links");
    return null;
  }
  if (!hasExtensionCommandFiles(source, manifest.commands, fsImpl)) {
    fail("Invalid cfhub extension manifest");
    return null;
  }
  return { source: sourcePath, manifest };
}
