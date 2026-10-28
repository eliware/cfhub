import { saveTokenProfile } from "./profile-save.mjs";

export async function persistApiTokenLogin({
  data,
  name,
  credential,
  opts,
  tokenInfo,
  detectedAccountToken,
  accountId,
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
  const stored = await writeCredentialImpl(name, credential);
  if (!stored) {
    fail("Could not save the API token to the OS keychain or private credential file");
    return false;
  }
  try {
    saveTokenProfile({
      data,
      name,
      opts,
      tokenInfo,
      detectedAccountToken,
      accountId,
      write,
      profileHome,
      profileFs,
      env,
    });
  } catch {
    let credentialsRemoved = false;
    try {
      if (previousCredential)
        credentialsRemoved = Boolean(await writeCredentialImpl(name, previousCredential));
      else credentialsRemoved = Boolean(await deleteCredentialImpl?.(name));
    } catch {}
    if (hadProfile) data.profiles[name] = previousProfile;
    else delete data.profiles[name];
    data.active = previousActive;
    fail(
      credentialsRemoved
        ? previousCredential
          ? "Could not save the API token profile. The previous credentials were restored."
          : "Could not save the API token profile. The saved credentials were removed."
        : "Could not save the API token profile. The credentials may remain saved.",
    );
    return false;
  }
  return true;
}
