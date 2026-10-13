import os from "node:os";
import { configRoot } from "./config.mjs";

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
    const dir = path.slice(0, path.lastIndexOf("/"));
    fsImpl.mkdirSync(dir, { recursive: true, mode: 0o700 });
    let data = {};
    if (fsImpl.existsSync(path)) data = JSON.parse(fsImpl.readFileSync(path, "utf8"));
    data[profile] = value;
    const temporary = `${path}.${process.pid}.tmp`;
    fsImpl.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
    if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(temporary, 0o600);
    fsImpl.renameSync(temporary, path);
    if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(path, 0o600);
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
    const temporary = `${path}.${process.pid}.tmp`;
    fsImpl.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
    if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(temporary, 0o600);
    fsImpl.renameSync(temporary, path);
    return true;
  } catch {
    return false;
  }
}
