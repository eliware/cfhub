import os from "node:os";
import * as fs from "node:fs";
import { deleteCredentialFile, readCredentialFile, writeCredentialFile } from "./files.mjs";
import {
  deleteKeychainCredential,
  loadKeychain,
  readKeychainCredential,
  writeKeychainCredential,
} from "./keychain.mjs";
export { credentialsPath } from "./files.mjs";

export async function readCredential(
  profile,
  load = loadKeychain,
  fsImpl = fs,
  homeDir = os.homedir(),
) {
  try {
    const value = await readKeychainCredential(profile, load);
    if (value) return value;
  } catch {}
  return readCredentialFile(profile, fsImpl, homeDir);
}

export async function writeCredential(
  profile,
  value,
  load = loadKeychain,
  fsImpl = fs,
  homeDir = os.homedir(),
) {
  try {
    if (await writeKeychainCredential(profile, value, load)) return true;
  } catch {}
  return writeCredentialFile(profile, value, fsImpl, homeDir);
}

export async function deleteCredential(
  profile,
  load = loadKeychain,
  fsImpl = fs,
  homeDir = os.homedir(),
) {
  let deleted = false;
  try {
    deleted = await deleteKeychainCredential(profile, load);
  } catch {}
  return deleteCredentialFile(profile, fsImpl, homeDir) || deleted;
}
