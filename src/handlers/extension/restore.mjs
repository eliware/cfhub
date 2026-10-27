export function restorePreviousExtension({ backupDestination, destination, fsImpl, installError }) {
  try {
    fsImpl.renameSync(backupDestination, destination);
  } catch (restoreError) {
    throw new Error(
      `Extension upgrade failed. Restore the backup at ${backupDestination}. ${restoreError.message}`,
      { cause: installError },
    );
  }
}
