import path from "node:path";

export function createExtensionStagingRoot(root, fsImpl) {
  return fsImpl.mkdtempSync(path.join(root, ".cfhub-extension-stage-"));
}

export function copyExtensionToStage({ source, stagingRoot, name, fsImpl }) {
  const stagedDestination = path.join(stagingRoot, name);
  fsImpl.cpSync(source, stagedDestination, { recursive: true });
  return stagedDestination;
}
