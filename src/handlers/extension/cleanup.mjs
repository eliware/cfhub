function removePath(path, fsImpl, installedSuccessfully, errors) {
  if (installedSuccessfully) {
    try {
      fsImpl.rmSync(path, { recursive: true, force: true });
    } catch (error) {
      errors.push({ path, error });
    }
    return;
  }
  fsImpl.rmSync(path, { recursive: true, force: true });
}

export function cleanupExtension({
  stagingRoot,
  backupRoot,
  originalMoved,
  preserveBackupRoot = false,
  installedSuccessfully,
  fsImpl,
}) {
  const errors = [];
  try {
    if (stagingRoot) removePath(stagingRoot, fsImpl, installedSuccessfully, errors);
  } finally {
    if (backupRoot && !originalMoved && !preserveBackupRoot) {
      removePath(backupRoot, fsImpl, installedSuccessfully, errors);
    }
  }
  return errors;
}
