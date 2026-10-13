import os from "node:os";
import * as fs from "node:fs";
import { deleteCredential, readCredential, writeCredential } from "./credentials.mjs";
import { refreshOAuth } from "./oauth.mjs";
import { activeProfile } from "./profile-store.mjs";

export { activeProfile, profilesPath, readProfiles, writeProfiles } from "./profile-store.mjs";

export async function applyActiveProfile(
  env = process.env,
  homeDir = os.homedir(),
  fsImpl = fs,
  effects = {},
) {
  const credentialReader =
    effects.readCredential || ((profile) => readCredential(profile, undefined, fsImpl, homeDir));
  const credentialWriter =
    effects.writeCredential ||
    ((profile, value) => writeCredential(profile, value, undefined, fsImpl, homeDir));
  const credentialDeleter =
    effects.deleteCredential ||
    ((profile) => deleteCredential(profile, undefined, fsImpl, homeDir));
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
    data.active =
      data.active === profile.name ? Object.keys(data.profiles)[0] || null : data.active;
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
      // A rejected refresh token cannot recover the old access token. Remove
      // the unusable local credential so the next login starts cleanly.
      await credentialDeleter(profile.name);
      const data = readProfiles(homeDir, fsImpl);
      delete data.profiles[profile.name];
      data.active =
        data.active === profile.name ? Object.keys(data.profiles)[0] || null : data.active;
      writeProfiles(data, homeDir, fsImpl);
      return null;
    }
  }
  const values = { ...profile, ...activeCredential };
  for (const [key, value] of Object.entries({
    CLOUDFLARE_API_TOKEN: values.oauthAccessToken || values.apiToken,
    CLOUDFLARE_ACCOUNT_ID: values.accountId,
    CLOUDFLARE_ZONE_ID: values.zoneId,
    CFHUB_OAUTH_SCOPES: values.scopes?.join(","),
    CFHUB_API_PERMISSIONS: values.apiPermissions?.join(","),
    /* istanbul ignore next -- profiles without API permission metadata are supported. */
    CFHUB_API_PERMISSIONS_KNOWN: values.apiPermissionsKnown ? "1" : undefined,
  }))
    if (value && !env[key]) env[key] = value;
  return { ...profile, ...credential };
}
