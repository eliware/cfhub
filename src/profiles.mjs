import os from "node:os";
import * as fs from "node:fs";
import { deleteCredential, readCredential, writeCredential } from "./identity/store.mjs";
import { refreshOAuth } from "./oauth/api.mjs";
import { activeProfile } from "./profile/store.mjs";
import { resolveCredentialLifecycle } from "./profile/credential-lifecycle.mjs";
import { applyProfileEnvironment } from "./profile/environment.mjs";

export { activeProfile, profilesPath, readProfiles, writeProfiles } from "./profile/store.mjs";

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
  const credentials = await resolveCredentialLifecycle({
    profileName: profile.name,
    credential,
    homeDir,
    fsImpl,
    writeCredential: credentialWriter,
    deleteCredential: credentialDeleter,
    refreshOAuth: refresh,
    now,
  });
  if (!credentials) return null;
  const values = { ...profile, ...credentials.activeCredential };
  applyProfileEnvironment(values, env);
  return { ...profile, ...credentials.credential };
}
