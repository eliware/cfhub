import path from "node:path";

export function replaceExtension({ source, destination, root, name, fsImpl }) {
  const stagingRoot = fsImpl.mkdtempSync(path.join(root, ".cfhub-extension-stage-"));
  const backupRoot = fsImpl.mkdtempSync(path.join(root, ".cfhub-extension-backup-"));
  const stagedDestination = path.join(stagingRoot, name);
  const backupDestination = path.join(backupRoot, name);
  let originalMoved = false;
  try {
    fsImpl.cpSync(source, stagedDestination, { recursive: true });
    fsImpl.renameSync(destination, backupDestination);
    originalMoved = true;
    try {
      fsImpl.renameSync(stagedDestination, destination);
      originalMoved = false;
    } catch (installError) {
      try {
        fsImpl.renameSync(backupDestination, destination);
        originalMoved = false;
      } catch (restoreError) {
        throw new Error(
          `Extension upgrade failed. Restore the backup at ${backupDestination}. ${restoreError.message}`,
          { cause: installError },
        );
      }
      throw installError;
    }
  } finally {
    fsImpl.rmSync(stagingRoot, { recursive: true, force: true });
    if (!originalMoved) fsImpl.rmSync(backupRoot, { recursive: true, force: true });
  }
}
