import os from "node:os";
import * as fs from "node:fs";
import { deleteCredential, readCredential, writeCredential } from "./credential-store.mjs";
import { refreshOAuth } from "./oauth-api.mjs";
import { activeProfile } from "./profile-store.mjs";
import { removeExpiredProfile } from "./profile-expiry.mjs";
import { applyProfileEnvironment } from "./profile-environment.mjs";

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
    await removeExpiredProfile(profile.name, homeDir, fsImpl, credentialDeleter);
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
      await removeExpiredProfile(profile.name, homeDir, fsImpl, credentialDeleter);
      return null;
    }
  }
  const values = { ...profile, ...activeCredential };
  applyProfileEnvironment(values, env);
  return { ...profile, ...credential };
}
