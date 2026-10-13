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
    const token = credential?.oauthRefreshToken || credential?.oauthAccessToken;
    if (token) await revokeOAuthImpl({ token });
  } catch {
    // Local cleanup must still happen when the remote token is expired.
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
