import { projectAuthProfiles } from "./auth-profile-view.mjs";

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
    const profiles = projectAuthProfiles(data, resource);
    return outputJson
      ? toJsonOutput(profiles)
      : printTable(
          ["ACTIVE", "NAME", "AUTH METHOD"],
          profiles.map((profile) => [profile.active ? "*" : "", profile.name, profile.authMethod]),
          printer.log,
        );
  }
  if (action === "switch") {
    const name = opts?.profile;
    if (!name || !data.profiles[name]) {
      fail(`Unknown profile: ${name || "(missing --profile)"}`);
      return;
    }
    data.active = name;
    write(data, profileHome, profileFs);
    return printer.log(`Activated profile ${name}`);
  }
  if (action === "logout") {
    const name = opts?.profile || data.active;
    if (!name || !data.profiles[name]) {
      fail(`Unknown profile: ${name || "(none)"}`);
      return;
    }
    const credential = await readCredentialImpl(name);
    try {
      if (credential?.oauthRefreshToken)
        await revokeOAuthImpl({ token: credential.oauthRefreshToken });
      else if (credential?.oauthAccessToken)
        await revokeOAuthImpl({ token: credential.oauthAccessToken });
    } catch {
      // Local cleanup must still happen when the remote token is expired.
    }
    try {
      await deleteCredentialImpl(name);
    } catch {
      /* local cleanup is best effort */
    }
    delete data.profiles[name];
    if (data.active === name) data.active = Object.keys(data.profiles)[0] || null;
    write(data, profileHome, profileFs);
    return printer.log(`Removed profile ${name}`);
  }
}
import { printTable } from "../output.mjs";
