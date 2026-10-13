import * as fs from "node:fs";
import { newerVersion } from "./version-comparison.mjs";
import { readUpdateCache, updateCachePath, writeUpdateCache } from "./update-cache.mjs";

const PACKAGE_URL = "https://registry.npmjs.org/cfhub/latest";
const DAY_MS = 24 * 60 * 60 * 1000;

export async function checkForUpdate({
  currentVersion,
  homeDir,
  env = process.env,
  fsImpl = fs,
  fetchImpl = globalThis.fetch,
  now = Date.now(),
  interval = DAY_MS,
} = {}) {
  if (!currentVersion || env.CFHUB_NO_UPDATE_CHECK === "1") return null;
  const path = updateCachePath(homeDir);
  const cache = readUpdateCache(path, fsImpl);
  if (now - Number(cache.checkedAt || 0) < interval) {
    return newerVersion(cache.latestVersion, currentVersion) ? cache.latestVersion : null;
  }
  if (typeof fetchImpl !== "function") return null;
  try {
    const signal =
      typeof globalThis.AbortSignal?.timeout === "function"
        ? globalThis.AbortSignal.timeout(2000)
        : undefined;
    const response = await fetchImpl(PACKAGE_URL, signal ? { signal } : {});
    if (!response.ok) return null;
    const latestVersion = (await response.json()).version;
    writeUpdateCache(path, homeDir, fsImpl, { checkedAt: now, latestVersion });
    return newerVersion(latestVersion, currentVersion) ? latestVersion : null;
  } catch {
    return null;
  }
}

export function updateNotice(latestVersion, currentVersion) {
  return latestVersion
    ? `A newer cfhub version is available: ${latestVersion} (installed: ${currentVersion})\nRun: npm install --global cfhub@latest`
    : null;
}
