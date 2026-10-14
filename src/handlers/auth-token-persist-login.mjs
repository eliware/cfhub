import { saveTokenProfile } from "./auth-token-profile-save.mjs";

export async function persistApiTokenLogin({
  data,
  name,
  credential,
  opts,
  tokenInfo,
  detectedAccountToken,
  accountId,
  writeCredentialImpl,
  write,
  profileHome,
  profileFs,
  fail,
}) {
  const stored = await writeCredentialImpl(name, credential);
  if (!stored) {
    fail("Could not save the API token to the OS keychain or private credential file");
    return false;
  }
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
  });
  return true;
}
