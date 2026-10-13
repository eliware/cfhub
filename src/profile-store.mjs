import os from "node:os";
import * as fs from "node:fs";
import { configRoot } from "./config.mjs";
import { replaceJsonFile } from "./atomic-json-file.mjs";
import { ensurePrivateDirectory, parentDirectory } from "./filesystem-paths.mjs";

export const profilesPath = (homeDir = os.homedir()) => `${configRoot(homeDir)}/profiles.json`;

export function readProfiles(homeDir = os.homedir(), fsImpl = fs) {
  const path = profilesPath(homeDir);
  if (typeof fsImpl.existsSync !== "function" || !fsImpl.existsSync(path))
    return { active: null, profiles: {} };
  return JSON.parse(fsImpl.readFileSync(path, "utf8"));
}

export function writeProfiles(data, homeDir = os.homedir(), fsImpl = fs) {
  const path = profilesPath(homeDir);
  ensurePrivateDirectory(parentDirectory(path), fsImpl);
  replaceJsonFile(path, data, fsImpl);
}

export function activeProfile(env = process.env, homeDir = os.homedir(), fsImpl = fs) {
  const data = readProfiles(homeDir, fsImpl);
  const name = env.CLOUDFLARE_PROFILE || data.active;
  return name && data.profiles[name] ? { name, ...data.profiles[name] } : null;
}
