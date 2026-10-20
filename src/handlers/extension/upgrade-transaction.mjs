import path from "node:path";
import { copyExtensionToStage, createExtensionStagingRoot } from "./staging.mjs";

export function replaceExtension({ source, destination, root, name, fsImpl }) {
  let stagingRoot;
  let backupRoot;
  let stagedDestination;
  let originalMoved = false;
  try {
    stagingRoot = createExtensionStagingRoot(root, fsImpl);
    backupRoot = fsImpl.mkdtempSync(path.join(root, ".cfhub-extension-backup-"));
    const backupDestination = path.join(backupRoot, name);
    stagedDestination = copyExtensionToStage({ source, stagingRoot, name, fsImpl });
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
    try {
      if (stagingRoot) fsImpl.rmSync(stagingRoot, { recursive: true, force: true });
    } finally {
      if (backupRoot && !originalMoved) fsImpl.rmSync(backupRoot, { recursive: true, force: true });
    }
  }
}
