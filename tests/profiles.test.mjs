import { jest } from "@jest/globals";
import {
  activeProfile as selectActiveProfile,
  applyActiveProfile as applyProfile,
  profilesPath,
  readProfiles as loadProfiles,
  writeProfiles as saveProfiles,
} from "../src/profiles.mjs";
import { deleteCredential, readCredential, writeCredential } from "../src/identity/store.mjs";
import { createMemoryFs } from "../test-fixtures/unit/memory-fs.mjs";

const fs = createMemoryFs();

function activeProfile(env, homeDir) {
  return selectActiveProfile(env, homeDir, fs);
}

function readProfiles(homeDir) {
  return loadProfiles(homeDir, fs);
}

function writeProfiles(data, homeDir) {
  return saveProfiles(data, homeDir, fs);
}

function applyActiveProfile(env, homeDir, fsImpl = fs, effects) {
  return applyProfile(env, homeDir, fsImpl, effects);
}

test("profile application exports known API permissions", async () => {
  const home = "/tmp/cfhub-home/profile-permissions";
  writeProfiles(
    {
      active: "work",
      profiles: {
        work: { apiToken: "token", apiPermissions: ["DNS Read"], apiPermissionsKnown: true },
      },
    },
    home,
  );
  const env = {};
  await applyActiveProfile(env, home);
  expect(env.CFHUB_API_PERMISSIONS).toBe("DNS Read");
  expect(env.CFHUB_API_PERMISSIONS_KNOWN).toBe("1");
});

test("profile selection honors explicit profile and missing storage", async () => {
  const home = "/tmp/cfhub-home/profile-empty";
  expect(readProfiles(home)).toEqual({ active: null, profiles: {} });
  expect(activeProfile({ CLOUDFLARE_PROFILE: "none" }, home)).toBeNull();
  expect(await applyActiveProfile({ CLOUDFLARE_ACCOUNT_ID: "existing" }, home)).toBeNull();
  expect(readProfiles(home, {})).toEqual({ active: null, profiles: {} });
  expect(profilesPath()).toContain("/.config/cfhub/profiles.json");
  expect(readProfiles(undefined, {})).toEqual({ active: null, profiles: {} });
  expect(activeProfile({}, undefined, {})).toBeNull();
  expect(await applyActiveProfile({}, undefined, {})).toBeNull();
  expect(activeProfile({}, home, {})).toBeNull();
  expect(await applyActiveProfile({}, home, {})).toBeNull();
  expect(await applyActiveProfile({}, home, {})).toBeNull();
  const implicit = activeProfile();
  expect(implicit === null || typeof implicit === "object").toBe(true);
  expect(await applyActiveProfile(undefined, undefined, {})).toBeNull();
});

test("profile application preserves explicit environment values", async () => {
  const home = "/tmp/cfhub-home/profile-values";
  writeProfiles(
    { active: "work", profiles: { work: { apiToken: "token", accountId: "a1" } } },
    home,
  );
  const env = { CLOUDFLARE_API_TOKEN: "existing", CLOUDFLARE_ACCOUNT_ID: "existing-account" };
  await applyActiveProfile(env, home);
  expect(env).toEqual({
    CLOUDFLARE_API_TOKEN: "existing",
    CLOUDFLARE_ACCOUNT_ID: "existing-account",
  });
});

test("profile application removes profiles when OAuth refresh fails", async () => {
  const home = "/tmp/cfhub-home/profile-oauth";
  writeProfiles({ active: "work", profiles: { work: {} } }, home);
  const credential = { oauthRefreshToken: "refresh", oauthAccessToken: "old", expiresAt: 100 };
  const readCredential = jest.fn().mockResolvedValue(credential);
  const writeCredential = jest.fn();
  const refreshOAuth = jest
    .fn()
    .mockResolvedValue({ accessToken: "new", refreshToken: "next", expiresAt: 9999 });
  const env = {};
  await applyActiveProfile(env, home, fs, {
    readCredential,
    writeCredential,
    refreshOAuth,
    now: () => 0,
  });
  expect(env.CLOUDFLARE_API_TOKEN).toBe("new");
  expect(writeCredential).toHaveBeenCalled();
  const failing = { ...credential };
  const fallbackEnv = {};
  await applyActiveProfile(fallbackEnv, home, fs, {
    readCredential: jest.fn().mockResolvedValue(failing),
    refreshOAuth: jest.fn().mockRejectedValue(new Error("expired")),
    now: () => 0,
  });
  expect(fallbackEnv.CLOUDFLARE_API_TOKEN).toBeUndefined();
  writeProfiles({ active: "other", profiles: { work: {}, other: {} } }, home);
  await applyActiveProfile({ CLOUDFLARE_PROFILE: "work" }, home, fs, {
    readCredential: jest.fn().mockResolvedValue(failing),
    deleteCredential: jest.fn(),
    refreshOAuth: jest.fn().mockRejectedValue(new Error("expired")),
    now: () => 0,
  });
  expect(readProfiles(home).active).toBe("other");
});

test("refreshed OAuth credentials take precedence over legacy profile access tokens", async () => {
  const home = "/tmp/cfhub-home/profile-legacy-oauth";
  writeProfiles(
    { active: "work", profiles: { work: { apiToken: "expired", accountId: "a1" } } },
    home,
  );
  const env = {};
  await applyActiveProfile(env, home, fs, {
    readCredential: jest.fn().mockResolvedValue({ oauthAccessToken: "fresh" }),
    now: () => 0,
  });
  expect(env.CLOUDFLARE_API_TOKEN).toBe("fresh");
});

test("default credential writer persists refreshed OAuth credentials to disk", async () => {
  const home = "/tmp/cfhub-home/profile-disk-refresh";
  writeProfiles({ active: "work", profiles: { work: {} } }, home);
  await applyActiveProfile({}, home, fs, {
    readCredential: jest
      .fn()
      .mockResolvedValue({ oauthRefreshToken: "refresh", oauthAccessToken: "old", expiresAt: 1 }),
    refreshOAuth: jest
      .fn()
      .mockResolvedValue({ accessToken: "new", refreshToken: "next", expiresAt: 9999 }),
    writeCredential: (profile, value) =>
      writeCredential(profile, value, jest.fn().mockResolvedValue(null), fs, home),
    now: () => 0,
  });
  const credentials = JSON.parse(fs.readFileSync(`${home}/.config/cfhub/credentials.json`, "utf8"));
  expect(credentials.work).toMatchObject({ oauthAccessToken: "new", oauthRefreshToken: "next" });
});

test("default credential writer persists through the configured credential adapter", async () => {
  const home = "/tmp/cfhub-home/profile-keychain";
  writeProfiles({ active: "keychain-test", profiles: { "keychain-test": {} } }, home);
  await applyActiveProfile({}, home, fs, {
    readCredential: jest
      .fn()
      .mockResolvedValue({ oauthRefreshToken: "refresh", oauthAccessToken: "old", expiresAt: 1 }),
    refreshOAuth: jest
      .fn()
      .mockResolvedValue({ accessToken: "new", refreshToken: "next", expiresAt: 9999 }),
    now: () => 0,
  });
  await expect(readCredential("keychain-test", undefined, fs, home)).resolves.toMatchObject({
    oauthAccessToken: "new",
  });
  await deleteCredential("keychain-test", undefined, fs, home);
});

test("expired OAuth credentials without refresh tokens are logged out", async () => {
  const home = "/tmp/cfhub-home/profile-expired";
  writeProfiles({ active: "work", profiles: { work: {}, other: {} } }, home);
  const deleteCredential = jest.fn().mockResolvedValue(true);
  const result = await applyActiveProfile({}, home, fs, {
    readCredential: jest.fn().mockResolvedValue({ oauthAccessToken: "expired", expiresAt: 1 }),
    deleteCredential,
    now: () => 0,
  });
  expect(result).toBeNull();
  expect(deleteCredential).toHaveBeenCalledWith("work");
  expect(readProfiles(home)).toEqual({ active: "other", profiles: { other: {} } });
  writeProfiles({ active: "other", profiles: { work: {}, other: {} } }, home);
  await expect(
    applyActiveProfile({ CLOUDFLARE_PROFILE: "work" }, home, fs, {
      readCredential: jest.fn().mockResolvedValue({ oauthAccessToken: "expired", expiresAt: 1 }),
      now: () => 0,
    }),
  ).resolves.toBeNull();
  expect(readProfiles(home)).toEqual({ active: "other", profiles: { other: {} } });
  writeProfiles({ active: "work", profiles: { work: {} } }, home);
  await expect(
    applyActiveProfile({}, home, fs, {
      readCredential: jest.fn().mockResolvedValue({ oauthAccessToken: "expired", expiresAt: 1 }),
      now: () => 0,
    }),
  ).resolves.toBeNull();
  expect(readProfiles(home)).toEqual({ active: null, profiles: {} });
});
