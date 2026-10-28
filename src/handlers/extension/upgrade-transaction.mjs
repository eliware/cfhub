import { cleanupExtension } from "./cleanup.mjs";
import { restorePreviousExtension } from "./restore.mjs";
import { copyExtensionToStage, createExtensionStagingRoot } from "./staging.mjs";
import { createExtensionBackup } from "./backup.mjs";
import { extensionCleanupReport } from "./cleanup-report.mjs";

export function replaceExtension({ source, destination, root, name, fsImpl }) {
  let stagingRoot;
  let backupRoot;
  let backupDestination;
  let stagedDestination;
  let originalMoved = false;
  let preserveBackupRoot = false;
  let installedSuccessfully = false;
  let cleanupErrors;
  try {
    stagingRoot = createExtensionStagingRoot(root, fsImpl);
    ({ backupRoot, backupDestination } = createExtensionBackup(root, name, fsImpl));
    stagedDestination = copyExtensionToStage({ source, stagingRoot, name, fsImpl });
    try {
      fsImpl.renameSync(destination, backupDestination);
    } catch (error) {
      preserveBackupRoot = true;
      throw new Error(
        `Could not move the installed extension. Inspect the backup at ${backupDestination}. ${error.message}`,
        { cause: error },
      );
    }
    originalMoved = true;
    try {
      fsImpl.renameSync(stagedDestination, destination);
      originalMoved = false;
      installedSuccessfully = true;
    } catch (installError) {
      restorePreviousExtension({ backupDestination, destination, fsImpl, installError });
      originalMoved = false;
      throw installError;
    }
  } finally {
    cleanupErrors = cleanupExtension({
      stagingRoot,
      backupRoot,
      originalMoved,
      preserveBackupRoot,
      installedSuccessfully,
      fsImpl,
    });
  }
  return extensionCleanupReport(backupRoot, backupDestination, cleanupErrors);
}
