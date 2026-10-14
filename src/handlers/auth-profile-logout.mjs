export async function logoutAuthProfile({
  name,
  data,
  readCredentialImpl,
  revokeOAuthImpl,
  deleteCredentialImpl,
  write,
  profileHome,
  profileFs,
  printer,
  fail,
}) {
  if (!name || !data.profiles[name]) {
    fail(`Unknown profile: ${name || "(none)"}`);
    return;
  }
  const credential = await readCredentialImpl(name);
  try {
    const isOAuthProfile = data.profiles[name].authMethod === "oauth";
    const token = isOAuthProfile
      ? credential?.oauthRefreshToken || credential?.oauthAccessToken
      : undefined;
    if (token && !(await revokeOAuthImpl({ token })))
      printer.error(
        "Cloudflare did not confirm OAuth token revocation. The local profile was removed.",
      );
  } catch {
    printer.error("Cloudflare could not revoke the OAuth token. The local profile was removed.");
  }
  try {
    await deleteCredentialImpl(name);
  } catch {
    // Local cleanup is best effort.
  }
  delete data.profiles[name];
  if (data.active === name) data.active = Object.keys(data.profiles)[0] || null;
  write(data, profileHome, profileFs);
  return printer.log(`Removed profile ${name}`);
}
