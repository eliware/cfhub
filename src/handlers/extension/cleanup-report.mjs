export function extensionCleanupReport(backupRoot, backupDestination, cleanupErrors) {
  if (cleanupErrors.length)
    return {
      backupDestination,
      backupRetained: cleanupErrors.some(({ path }) => path === backupRoot),
      cleanupErrors,
    };
}
