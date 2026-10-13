import os from "node:os";
import * as fs from "node:fs";
import {
  deleteCredentialFile,
  readCredentialFile,
  writeCredentialFile,
} from "./credential-files.mjs";

const SERVICE = "cfhub";
export { credentialsPath } from "./credential-files.mjs";

async function keychain() {
  try {
    return (await import("keytar")).default;
  } catch {
    return null;
  }
}

export async function readCredential(
  profile,
  load = keychain,
  fsImpl = fs,
  homeDir = os.homedir(),
) {
  try {
    const store = await load();
    if (store) {
      const value = await store.getPassword(SERVICE, profile);
      if (value) return JSON.parse(value);
    }
  } catch {}
  return readCredentialFile(profile, fsImpl, homeDir);
}

export async function writeCredential(
  profile,
  value,
  load = keychain,
  fsImpl = fs,
  homeDir = os.homedir(),
) {
  try {
    const store = await load();
    if (store) {
      await store.setPassword(SERVICE, profile, JSON.stringify(value));
      return true;
    }
  } catch {}
  return writeCredentialFile(profile, value, fsImpl, homeDir);
}

export async function deleteCredential(
  profile,
  load = keychain,
  fsImpl = fs,
  homeDir = os.homedir(),
) {
  let deleted = false;
  try {
    const store = await load();
    if (store) deleted = await store.deletePassword(SERVICE, profile);
  } catch {}
  return deleteCredentialFile(profile, fsImpl, homeDir) || deleted;
}
