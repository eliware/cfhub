import os from 'node:os';
import * as fs from 'node:fs';
import { configRoot } from './config.mjs';

const SERVICE = 'cfhub';
export function credentialsPath(homeDir = os.homedir()) {
  return `${configRoot(homeDir)}/credentials.json`;
}

function readDisk(profile, fsImpl, homeDir) {
  try {
    const path = credentialsPath(homeDir);
    if (!fsImpl.existsSync(path)) return null;
    const data = JSON.parse(fsImpl.readFileSync(path, 'utf8'));
    return data?.[profile] || null;
  } catch { return null; }
}

function writeDisk(profile, value, fsImpl, homeDir) {
  try {
    const path = credentialsPath(homeDir);
    const dir = path.slice(0, path.lastIndexOf('/'));
    fsImpl.mkdirSync(dir, { recursive: true, mode: 0o700 });
    let data = {};
    if (fsImpl.existsSync(path)) data = JSON.parse(fsImpl.readFileSync(path, 'utf8'));
    data[profile] = value;
    const temporary = `${path}.${process.pid}.tmp`;
    fsImpl.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
    if (typeof fsImpl.chmodSync === 'function') fsImpl.chmodSync(temporary, 0o600);
    fsImpl.renameSync(temporary, path);
    if (typeof fsImpl.chmodSync === 'function') fsImpl.chmodSync(path, 0o600);
    return true;
  } catch { return false; }
}

function deleteDisk(profile, fsImpl, homeDir) {
  try {
    const path = credentialsPath(homeDir);
    if (!fsImpl.existsSync(path)) return false;
    const data = JSON.parse(fsImpl.readFileSync(path, 'utf8'));
    if (!data || !Object.hasOwn(data, profile)) return false;
    delete data[profile];
    const temporary = `${path}.${process.pid}.tmp`;
    fsImpl.writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
    if (typeof fsImpl.chmodSync === 'function') fsImpl.chmodSync(temporary, 0o600);
    fsImpl.renameSync(temporary, path);
    return true;
  } catch { return false; }
}

/* istanbul ignore next */
async function keychain() {
  try { return (await import('keytar')).default; } catch { return null; }
}

export async function readCredential(profile, load = keychain, fsImpl = fs, homeDir = os.homedir()) {
  try {
    const store = await load();
    if (store) {
      const value = await store.getPassword(SERVICE, profile);
      if (value) return JSON.parse(value);
    }
  } catch {}
  return readDisk(profile, fsImpl, homeDir);
}

export async function writeCredential(profile, value, load = keychain, fsImpl = fs, homeDir = os.homedir()) {
  try {
    const store = await load();
    if (store) { await store.setPassword(SERVICE, profile, JSON.stringify(value)); return true; }
  } catch {}
  return writeDisk(profile, value, fsImpl, homeDir);
}

export async function deleteCredential(profile, load = keychain, fsImpl = fs, homeDir = os.homedir()) {
  let deleted = false;
  try {
    const store = await load();
    if (store) deleted = await store.deletePassword(SERVICE, profile);
  } catch {}
  return deleteDisk(profile, fsImpl, homeDir) || deleted;
}
