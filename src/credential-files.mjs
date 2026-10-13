import os from "node:os";
import { configRoot } from "./config.mjs";
import { replaceJsonFile } from "./atomic-json-file.mjs";
import { ensurePrivateDirectory, parentDirectory } from "./filesystem-paths.mjs";

export const credentialsPath = (homeDir = os.homedir()) =>
  `${configRoot(homeDir)}/credentials.json`;

export function readCredentialFile(profile, fsImpl, homeDir) {
  try {
    const path = credentialsPath(homeDir);
    if (!fsImpl.existsSync(path)) return null;
    const data = JSON.parse(fsImpl.readFileSync(path, "utf8"));
    return data?.[profile] || null;
  } catch {
    return null;
  }
}

export function writeCredentialFile(profile, value, fsImpl, homeDir) {
  try {
    const path = credentialsPath(homeDir);
    ensurePrivateDirectory(parentDirectory(path), fsImpl);
    let data = {};
    if (fsImpl.existsSync(path)) data = JSON.parse(fsImpl.readFileSync(path, "utf8"));
    data[profile] = value;
    replaceJsonFile(path, data, fsImpl);
    return true;
  } catch {
    return false;
  }
}

export function deleteCredentialFile(profile, fsImpl, homeDir) {
  try {
    const path = credentialsPath(homeDir);
    if (!fsImpl.existsSync(path)) return false;
    const data = JSON.parse(fsImpl.readFileSync(path, "utf8"));
    if (!data || !Object.hasOwn(data, profile)) return false;
    delete data[profile];
    replaceJsonFile(path, data, fsImpl);
    return true;
  } catch {
    return false;
  }
}
