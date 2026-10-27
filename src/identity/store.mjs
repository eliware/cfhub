import os from "node:os";
import * as fs from "node:fs";
import {
  deleteFromBackends,
  readFromPreferredBackend,
  writeToPreferredBackend,
} from "./backend.mjs";
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
  return readFromPreferredBackend(
    () => readKeychainCredential(profile, load),
    () => readCredentialFile(profile, fsImpl, homeDir),
  );
}

export async function writeCredential(
  profile,
  value,
  load = loadKeychain,
  fsImpl = fs,
  homeDir = os.homedir(),
) {
  return writeToPreferredBackend(
    () => writeKeychainCredential(profile, value, load),
    () => writeCredentialFile(profile, value, fsImpl, homeDir),
  );
}

export async function deleteCredential(
  profile,
  load = loadKeychain,
  fsImpl = fs,
  homeDir = os.homedir(),
) {
  return deleteFromBackends(
    () => deleteKeychainCredential(profile, load),
    () => deleteCredentialFile(profile, fsImpl, homeDir),
  );
}
