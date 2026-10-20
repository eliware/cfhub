import { configRoot } from "../config.mjs";

export function updateCachePath(homeDir) {
  return `${configRoot(homeDir)}/update-check.json`;
}

export function readUpdateCache(path, fsImpl) {
  try {
    if (fsImpl.existsSync(path)) return JSON.parse(fsImpl.readFileSync(path, "utf8"));
  } catch {}
  return {};
}
