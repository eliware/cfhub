import { removeExpiredProfile } from "./expiry.mjs";

const EXPIRY_BUFFER_MS = 60_000;

function expiresSoon(credential, now) {
  return Boolean(credential?.expiresAt && credential.expiresAt <= now() + EXPIRY_BUFFER_MS);
}

export async function resolveCredentialLifecycle({
  profileName,
  credential,
  homeDir,
  fsImpl,
  writeCredential,
  deleteCredential,
  refreshOAuth,
  now = Date.now,
  removeExpired = removeExpiredProfile,
}) {
  const expired = expiresSoon(credential, now);
  if (credential?.oauthAccessToken && expired && !credential.oauthRefreshToken) {
    await removeExpired(profileName, homeDir, fsImpl, deleteCredential);
    return null;
  }

  let activeCredential = credential;
  if (credential?.oauthRefreshToken && expired) {
    try {
      const refreshed = await refreshOAuth({ refreshToken: credential.oauthRefreshToken });
      activeCredential = {
        ...refreshed,
        oauthAccessToken: refreshed.accessToken,
        oauthRefreshToken: refreshed.refreshToken,
      };
      await writeCredential(profileName, { ...credential, ...activeCredential });
    } catch {
      await removeExpired(profileName, homeDir, fsImpl, deleteCredential);
      return null;
    }
  }

  return { credential, activeCredential };
}
