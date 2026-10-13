import os from "node:os";
import * as fs from "node:fs";
import { configRoot } from "./config.mjs";

export const profilesPath = (homeDir = os.homedir()) => `${configRoot(homeDir)}/profiles.json`;

export function readProfiles(homeDir = os.homedir(), fsImpl = fs) {
  const path = profilesPath(homeDir);
  if (typeof fsImpl.existsSync !== "function" || !fsImpl.existsSync(path))
    return { active: null, profiles: {} };
  return JSON.parse(fsImpl.readFileSync(path, "utf8"));
}

export function writeProfiles(data, homeDir = os.homedir(), fsImpl = fs) {
  const path = profilesPath(homeDir);
  const dir = path.slice(0, path.lastIndexOf("/"));
  fsImpl.mkdirSync(dir, { recursive: true });
  fsImpl.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(path, 0o600);
}

export function activeProfile(env = process.env, homeDir = os.homedir(), fsImpl = fs) {
  const data = readProfiles(homeDir, fsImpl);
  const name = env.CLOUDFLARE_PROFILE || data.active;
  return name && data.profiles[name] ? { name, ...data.profiles[name] } : null;
}
