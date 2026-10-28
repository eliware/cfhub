export async function saveOAuthProfile({
  data,
  name,
  opts,
  scopes,
  oauth,
  writeCredentialImpl,
  readCredentialImpl,
  deleteCredentialImpl,
  write,
  profileHome,
  profileFs,
  fail,
  env = process.env,
}) {
  const hadProfile = Object.hasOwn(data.profiles, name);
  const previousProfile = data.profiles[name];
  const previousActive = data.active;
  let previousCredential;
  if (hadProfile && readCredentialImpl) {
    try {
      previousCredential = await readCredentialImpl(name);
    } catch {
      fail("Could not read the saved profile credentials before login");
      return false;
    }
  }
  const stored = await writeCredentialImpl(name, {
    oauthAccessToken: oauth.accessToken,
    oauthRefreshToken: oauth.refreshToken,
    expiresIn: oauth.expiresIn,
    expiresAt: oauth.expiresAt,
  });
  if (!stored) {
    fail("Could not save OAuth credentials to the OS keychain or private credential file");
    return false;
  }
  try {
    data.profiles[name] = {
      authMethod: "oauth",
      scopes: oauth.scopes || scopes,
      accountId: opts?.["account-id"] || env.CLOUDFLARE_ACCOUNT_ID,
      zoneId: opts?.["zone-id"] || env.CLOUDFLARE_ZONE_ID,
    };
    data.active = name;
    write(data, profileHome, profileFs);
  } catch {
    try {
      if (
        previousCredential
          ? await writeCredentialImpl(name, previousCredential)
          : await deleteCredentialImpl?.(name)
      ) {
        if (hadProfile) data.profiles[name] = previousProfile;
        else delete data.profiles[name];
        data.active = previousActive;
        fail(
          previousCredential
            ? "Could not save the OAuth profile. The previous credentials were restored."
            : "Could not save the OAuth profile. The saved credentials were removed.",
        );
        return false;
      }
    } catch {}
    if (hadProfile) data.profiles[name] = previousProfile;
    else delete data.profiles[name];
    data.active = previousActive;
    fail("Could not save the OAuth profile. The credentials may remain saved.");
    return false;
  }
  return true;
}
