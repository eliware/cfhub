import { jest } from '@jest/globals';
import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { credentialsPath, deleteCredential, readCredential, writeCredential } from '../src/credentials.mjs';

test('credential adapter reads, writes, and deletes keychain entries', async () => {
  const store = { getPassword: jest.fn().mockResolvedValue(JSON.stringify({ token: 'secret' })), setPassword: jest.fn().mockResolvedValue(), deletePassword: jest.fn().mockResolvedValue(true) };
  const load = jest.fn().mockResolvedValue(store);
  await expect(readCredential('work', load)).resolves.toEqual({ token: 'secret' });
  await expect(writeCredential('work', { token: 'new' }, load)).resolves.toBe(true);
  await expect(deleteCredential('work', load)).resolves.toBe(true);
  expect(store.setPassword).toHaveBeenCalledWith('cf', 'work', JSON.stringify({ token: 'new' }));
});

test('credential adapter falls back to disk when keychain is unavailable', async () => {
  const unavailable = jest.fn().mockResolvedValue(null);
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-credentials-'));
  await expect(readCredential('work', unavailable, fs, home)).resolves.toBeNull();
  await expect(writeCredential('work', { token: 'disk' }, unavailable, fs, home)).resolves.toBe(true);
  await expect(readCredential('work', unavailable, fs, home)).resolves.toEqual({ token: 'disk' });
  expect(credentialsPath(home)).toContain('/.config/cfhub/credentials.json');
  const expectedMode = process.platform === 'win32' ? 0o666 : 0o600;
  expect(fs.statSync(credentialsPath(home)).mode & 0o777).toBe(expectedMode);
  await expect(deleteCredential('work', unavailable, fs, home)).resolves.toBe(true);
  await expect(readCredential('work', unavailable, fs, home)).resolves.toBeNull();
});

test('disk credential adapter handles malformed and failing files safely', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-credentials-errors-'));
  const malformed = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => '{bad-json'),
  };
  await expect(readCredential('work', jest.fn().mockResolvedValue(null), malformed, home)).resolves.toBeNull();
  const failing = {
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(() => { throw new Error('read-only'); }),
    readFileSync: jest.fn(() => '{}'),
  };
  await expect(writeCredential('work', {}, jest.fn().mockResolvedValue(null), failing, home)).resolves.toBe(false);
  const deleteFailing = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => { throw new Error('read-only'); }),
  };
  await expect(deleteCredential('work', jest.fn().mockResolvedValue(null), deleteFailing, home)).resolves.toBe(false);
});

test('credential adapter falls back to disk when keychain fails', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-credentials-failing-'));
  const failing = jest.fn().mockRejectedValue(new Error('unavailable'));
  await expect(writeCredential('work', { token: 'disk' }, failing, fs, home)).resolves.toBe(true);
  await expect(readCredential('work', failing, fs, home)).resolves.toEqual({ token: 'disk' });
});

test('credential adapter treats an empty keychain value as absent', async () => {
  const store = { getPassword: jest.fn().mockResolvedValue('') };
  await expect(readCredential('work', jest.fn().mockResolvedValue(store))).resolves.toBeNull();
});

test('credential adapter rejects malformed keychain values safely', async () => {
  const store = { getPassword: jest.fn().mockResolvedValue('{bad-json') };
  await expect(readCredential('work', jest.fn().mockResolvedValue(store))).resolves.toBeNull();
});

test('credential adapter uses its default keychain loader safely', async () => {
  await readCredential('missing-profile');
  await writeCredential('missing-profile', {});
  await deleteCredential('missing-profile');
});

test('disk credential adapter covers default arguments and filesystems without chmod', async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-credentials-defaults-'));
  const files = new Map();
  const noChmodFs = {
    existsSync: (file) => files.has(file),
    mkdirSync: jest.fn(),
    readFileSync: (file) => files.get(file),
    writeFileSync: (file, value) => files.set(file, value),
    renameSync: (from, to) => { files.set(to, files.get(from)); files.delete(from); },
  };
  expect(credentialsPath()).toContain('/.config/cfhub/credentials.json');
  await expect(readCredential('missing', jest.fn().mockResolvedValue(null), undefined, home)).resolves.toBeNull();
  await expect(writeCredential('work', { token: 'one' }, jest.fn().mockResolvedValue(null), noChmodFs, home)).resolves.toBe(true);
  await expect(writeCredential('other', { token: 'two' }, jest.fn().mockResolvedValue(null), noChmodFs, home)).resolves.toBe(true);
  await expect(deleteCredential('other', jest.fn().mockResolvedValue(null), noChmodFs, home)).resolves.toBe(true);
  files.clear();
  await expect(deleteCredential('missing', jest.fn().mockResolvedValue(null), noChmodFs, home)).resolves.toBe(false);
  files.set(`${home}/.config/cfhub/credentials.json`, '{}');
  await expect(deleteCredential('missing', jest.fn().mockResolvedValue(null), noChmodFs, home)).resolves.toBe(false);
  await expect(writeCredential('default-fs', { token: 'disk' }, jest.fn().mockResolvedValue(null), undefined, home)).resolves.toBe(true);
  await expect(readCredential('default-fs', jest.fn().mockResolvedValue(null), undefined, home)).resolves.toEqual({ token: 'disk' });
  await expect(deleteCredential('default-fs', jest.fn().mockResolvedValue(null), undefined, home)).resolves.toBe(true);
});
