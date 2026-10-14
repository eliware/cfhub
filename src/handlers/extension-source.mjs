import path from "node:path";
import { validateExtensionManifest } from "../extensions.mjs";

function hasCommandFiles(source, commands, fsImpl) {
  return Object.values(commands).every((commandPath) => {
    const modulePath = path.resolve(source, commandPath);
    try {
      return fsImpl.statSync(modulePath).isFile();
    } catch {
      return false;
    }
  });
}

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
  if (!hasCommandFiles(source, manifest.commands, fsImpl)) {
    fail("Invalid cfhub extension manifest");
    return null;
  }
  return { source: sourcePath, manifest };
}
