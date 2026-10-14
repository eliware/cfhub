import { outputAuthProfiles } from "./auth-profile-view.mjs";
import { logoutAuthProfile } from "./auth-profile-logout.mjs";
import { switchAuthProfile } from "./auth-profile-switch.mjs";

export async function handleAuthProfile({
  action,
  resource,
  opts,
  data,
  outputJson,
  toJsonOutput,
  printer,
  fail,
  write,
  profileHome,
  profileFs,
  readCredentialImpl,
  revokeOAuthImpl,
  deleteCredentialImpl,
}) {
  if (action === "list") {
    return outputAuthProfiles({ data, resource, outputJson, toJsonOutput, printer });
  }
  if (action === "switch")
    return switchAuthProfile({ opts, data, write, profileHome, profileFs, printer, fail });
  if (action === "logout") {
    const name = opts?.profile || data.active;
    return logoutAuthProfile({
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
    });
  }
}
