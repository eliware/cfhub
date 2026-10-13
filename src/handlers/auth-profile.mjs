import { projectAuthProfiles } from "./auth-profile-view.mjs";
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
    const profiles = projectAuthProfiles(data, resource);
    return outputJson
      ? toJsonOutput(profiles)
      : printTable(
          ["ACTIVE", "NAME", "AUTH METHOD"],
          profiles.map((profile) => [profile.active ? "*" : "", profile.name, profile.authMethod]),
          printer.log,
        );
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
import { printTable } from "../output-table.mjs";
