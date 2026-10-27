export function extensionCleanupReport(backupDestination, cleanupErrors) {
  if (cleanupErrors.length) return { backupDestination, cleanupErrors };
}
