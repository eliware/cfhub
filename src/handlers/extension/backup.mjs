import path from "node:path";

export function createExtensionBackup(root, name, fsImpl) {
  const backupRoot = fsImpl.mkdtempSync(path.join(root, ".cfhub-extension-backup-"));
  return { backupRoot, backupDestination: path.join(backupRoot, name) };
}
