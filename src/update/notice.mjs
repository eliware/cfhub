export function updateNotice(latestVersion, currentVersion) {
  return latestVersion
    ? `A newer cfhub version is available: ${latestVersion} (installed: ${currentVersion})\nRun: npm install --global @eliware/cfhub@latest`
    : null;
}
