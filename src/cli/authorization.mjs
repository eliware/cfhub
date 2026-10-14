import { applyActiveProfile } from "../profiles.mjs";
import { missingScopes } from "../scopes.mjs";
import { missingApiPermissions } from "../api-permissions.mjs";
import {
  managesCredentials,
  missingApiPermissionMessage,
  missingScopeMessage,
} from "./authorization-rules.mjs";

export async function authorizeCommand({
  resource,
  action,
  opts = {},
  env,
  loadEnv,
  projectRoot,
  homeDir,
  fsImpl,
  printer,
  exit,
  cfFactory,
}) {
  loadEnv(projectRoot, env, fsImpl);
  const managesCredentialAction = managesCredentials(resource, action);
  if (!managesCredentialAction) await applyActiveProfile(env, homeDir, fsImpl);
  const grantedScopes = env.CFHUB_OAUTH_SCOPES?.split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
  const permissionOptions = { dryRun: Boolean(opts["dry-run"]) };
  const missing = managesCredentialAction
    ? []
    : missingScopes(resource, action, grantedScopes, permissionOptions);
  if (missing.length) {
    printer.error(missingScopeMessage(missing));
    return { allowed: false, result: exit(1) };
  }
  const apiPermissions =
    env.CFHUB_API_PERMISSIONS_KNOWN === "1"
      ? env.CFHUB_API_PERMISSIONS?.split(",")
          .map((permission) => permission.trim())
          .filter(Boolean)
      : null;
  const missingApi = managesCredentialAction
    ? []
    : missingApiPermissions(resource, action, apiPermissions, permissionOptions);
  if (missingApi.length) {
    printer.error(missingApiPermissionMessage(missingApi));
    return { allowed: false, result: exit(1) };
  }
  return { allowed: true, cf: managesCredentialAction ? null : cfFactory({ env }) };
}
