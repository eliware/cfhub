import os from "node:os";
import * as fs from 'node:fs';
import { configRoot } from "./config.mjs";
import { deleteCredential, readCredential, writeCredential } from "./credentials.mjs";
import { refreshOAuth } from "./oauth.mjs";

export function profilesPath(homeDir = os.homedir()) {
  return `${configRoot(homeDir)}/profiles.json`;
}

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
  fsImpl.writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, {
    mode: 0o600,
  });
  if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(path, 0o600);
}

export function activeProfile(
  env = process.env,
  homeDir = os.homedir(),
  fsImpl = fs,
) {
  const data = readProfiles(homeDir, fsImpl);
  const name = env.CLOUDFLARE_PROFILE || data.active;
  return name && data.profiles[name] ? { name, ...data.profiles[name] } : null;
}

export async function applyActiveProfile(
  env = process.env,
  homeDir = os.homedir(),
  fsImpl = fs,
  effects = {},
) {
  const credentialReader = effects.readCredential || ((profile) => readCredential(profile, undefined, fsImpl, homeDir));
  const credentialWriter = effects.writeCredential || ((profile, value) => writeCredential(profile, value, undefined, fsImpl, homeDir));
  const credentialDeleter = effects.deleteCredential || ((profile) => deleteCredential(profile, undefined, fsImpl, homeDir));
  const refresh = effects.refreshOAuth || refreshOAuth;
  const now = effects.now || Date.now;
  const profile = activeProfile(env, homeDir, fsImpl);
  if (!profile) return null;
  const credential = await credentialReader(profile.name);
  if (
    credential?.oauthAccessToken &&
    credential.expiresAt &&
    credential.expiresAt <= now() + 60_000 &&
    !credential.oauthRefreshToken
  ) {
    await credentialDeleter(profile.name);
    const data = readProfiles(homeDir, fsImpl);
    delete data.profiles[profile.name];
    data.active = data.active === profile.name
      ? Object.keys(data.profiles)[0] || null
      : data.active;
    writeProfiles(data, homeDir, fsImpl);
    return null;
  }
  let activeCredential = credential;
  if (
    credential?.oauthRefreshToken &&
    credential.expiresAt &&
    credential.expiresAt <= now() + 60_000
  ) {
    try {
      const refreshed = await refresh({
        refreshToken: credential.oauthRefreshToken,
      });
      activeCredential = {
        ...refreshed,
        oauthAccessToken: refreshed.accessToken,
        oauthRefreshToken: refreshed.refreshToken,
      };
      await credentialWriter(profile.name, {
        ...credential,
        ...activeCredential,
      });
    } catch {
      activeCredential = credential;
    }
  }
  const values = { ...profile, ...activeCredential };
  for (const [key, value] of Object.entries({
    CLOUDFLARE_API_TOKEN: values.oauthAccessToken || values.apiToken,
    CLOUDFLARE_ACCOUNT_ID: values.accountId,
    CLOUDFLARE_ZONE_ID: values.zoneId,
    CF_OAUTH_SCOPES: values.scopes?.join(","),
  }))
    if (value && !env[key]) env[key] = value;
  return { ...profile, ...credential };
}
