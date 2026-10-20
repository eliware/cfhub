import path from "node:path";
import { copyExtensionToStage, createExtensionStagingRoot } from "./staging.mjs";

export function replaceExtension({ source, destination, root, name, fsImpl }) {
  let stagingRoot;
  let backupRoot;
  let backupDestination;
  let stagedDestination;
  let originalMoved = false;
  let installedSuccessfully = false;
  const cleanupErrors = [];
  try {
    stagingRoot = createExtensionStagingRoot(root, fsImpl);
    backupRoot = fsImpl.mkdtempSync(path.join(root, ".cfhub-extension-backup-"));
    backupDestination = path.join(backupRoot, name);
    stagedDestination = copyExtensionToStage({ source, stagingRoot, name, fsImpl });
    fsImpl.renameSync(destination, backupDestination);
    originalMoved = true;
    try {
      fsImpl.renameSync(stagedDestination, destination);
      originalMoved = false;
      installedSuccessfully = true;
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
      if (stagingRoot) {
        if (installedSuccessfully) {
          try {
            fsImpl.rmSync(stagingRoot, { recursive: true, force: true });
          } catch (error) {
            cleanupErrors.push({ path: stagingRoot, error });
          }
        } else fsImpl.rmSync(stagingRoot, { recursive: true, force: true });
      }
    } finally {
      if (backupRoot && !originalMoved) {
        if (installedSuccessfully) {
          try {
            fsImpl.rmSync(backupRoot, { recursive: true, force: true });
          } catch (error) {
            cleanupErrors.push({ path: backupRoot, error });
          }
        } else fsImpl.rmSync(backupRoot, { recursive: true, force: true });
      }
    }
  }
  if (cleanupErrors.length) return { backupDestination, cleanupErrors };
}
